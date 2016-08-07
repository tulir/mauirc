// mauIRC - The original mauIRC web frontend
// Copyright (C) 2016 Tulir Asokan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Package conn contains connection code
package conn

import (
	"encoding/json"
	"fmt"
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"
	"github.com/gopherjs/websocket"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/ui"
	"maunium.net/go/mauirc/util"
	"time"
)

func init() {
	js.Global.Set("socket", map[string]interface{}{
		"sendMessage": SendMessage,
		"connect":     Connect,
		"disconnect":  Disconnect,
		"reconnect":   Reconnect,
	})
}

// SendMessage sends the given struct through the WebSocket
func SendMessage(payload interface{}) bool {
	if payload == nil {
		return false
	}

	var dat = util.MarshalString(payload)

	if len(dat) > 1024 {
		return false
	}

	data.Socket.Send(dat)
	return true
}

// Connect to the socket
func Connect() {
	var err error
	data.Socket, err = websocket.New(data.SocketPath)
	if err != nil {
		panic(err)
	}

	data.Socket.AddEventListener("open", false, open)
	data.Socket.AddEventListener("message", false, message)
	data.Socket.AddEventListener("close", false, close)
	data.Socket.AddEventListener("error", false, errorr)

	go func() {
		for msg := range data.Messages {
			SendMessage(msg)
		}
	}()
}

// Disconnect from the socket
func Disconnect() {
	err := data.Socket.Close()
	if err != nil {
		panic(err)
	}
}

func open(evt *js.Object) {
	templates.Apply("main", "#container", nil)
	jq("#disconnected").AddClass("hidden")
	data.Connected = true
}

func message(evt *js.Object) {
	var msg messages.Container

	if err := json.Unmarshal([]byte(evt.Get("data").String()), &msg); err != nil {
		panic(err)
	}

	switch msg.Type { // TODO implement
	case messages.MsgMessage:
		msgData := messages.ParseMessage(msg.Object)
		chanData := data.Networks.MustGetChannel(msgData.Network, msgData.Channel)
		if chanData.FetchingHistory {
			chanData.MessageCache <- msgData
		} else {
			ui.Receive(msgData, true)
		}
	case messages.MsgChanList:
		msgData := messages.ParseChanList(msg.Object)
		data.Networks.MustGet(msgData.Network).ChannelNames = msgData.List
	case messages.MsgChanData:
		msgData := messages.ParseChanData(msg.Object)
		chanData := data.Networks.MustGetChannel(msgData.Network, msgData.Name)
		chanData.SetTopicData(msgData.Topic, msgData.TopicSetBy, msgData.TopicSetAt)
		chanData.SetUserlist(msgData.Userlist)
		chanData.Notifications = data.ParseNotificationLevel("all") // FIXME
		ui.OpenChannel(msgData.Network, msgData.Name, false)
		if ui.GetActiveNetwork() == msgData.Network && ui.GetActiveChannel() == msgData.Name {
			//ui.UpdateTitle() TODO
			ui.UpdateUserlist()
		}
	case messages.MsgNetData:
		msgData := messages.ParseNetData(msg.Object)
		if ui.GetNetwork(msgData.Name).Length == 0 {
			ui.OpenNetwork(msgData.Name)
			// scripts.Update(msgData.Name, false) TODO
		}
		data.Networks.MustGet(msgData.Name).SetNetData(msgData)
		/* TODO
		ui.SetNetworkConnected(msgData.Name, msgData.Connected)

		Original JS implementation:
			if(ed.object.connected) {
			  $(sprintf("#switchnet-%s", ed.object.name)).removeClass("disconnected")
			} else {
			  $(sprintf("#switchnet-%s", ed.object.name)).addClass("disconnected")
			}
		*/
	case messages.MsgNickChange:
		msgData := messages.ParseNickChange(msg.Object)
		fmt.Println("Nick changed to", msgData.Nick, "on", msgData.Network)
		data.Networks.Get(msgData.Network).Nick = msgData.Nick
	case messages.MsgClear:
		msgData := messages.ParseClearHistory(msg.Object)
		ui.GetChannel(msgData.Network, msgData.Channel).Empty()
	case messages.MsgDelete:
		jq(fmt.Sprintf("#msgwrap-%s", msg.Object)).Remove()
	case messages.MsgWhois:
		msgData := messages.ParseWhoisData(msg.Object)
		ui.OpenWhoisModal(msgData)
	case messages.MsgInvite:
		msgData := messages.ParseInvite(msg.Object)
		ui.OpenChannel(msgData.Network, msgData.Channel, false)
		templates.ApplyObj("invite", ui.GetChannel(msgData.Network, msgData.Channel), map[string]interface{}{
			"Network": msgData.Network,
			"Channel": msgData.Channel,
			"Sender":  msgData.Sender,
		})
		/* TODO fix template invite
		  sender: ed.object.sender,
		  channel: ed.object.channel,
		  accept: sprintf("acceptInvite('%s', '%s')", ed.object.network, ed.object.channel),
		  ignore: sprintf("closeChannel('%s', '%s')", ed.object.network, ed.object.channel)

		  TODO implement the following
		$(sprintf("#switchto-%s-%s", ed.object.network.toLowerCase(), channelFilter(ed.object.channel))).addClass("new-messages")
		*/
	case messages.MsgRaw:
		msgData := messages.ParseRawMessage(msg.Object)
		jq(fmt.Sprintf("#raw-output-%s", msgData.Network)).Append(fmt.Sprintf("<div class='rawoutmsg'>%s</div>", msgData.Message))
	}
}

func close(evt *js.Object) {
	if evt.Get("wasClean").Bool() {
		return
	}

	if data.Connected {
		jq("#disconnected").RemoveClass("hidden")
		data.Connected = false
	}

	if !data.AuthFail {
		time.AfterFunc(10*time.Second, Reconnect)
	}
}

// Reconnect tries to reconnect to the mauIRC server
func Reconnect() {
	jquery.Ajax(map[string]interface{}{
		"type": "GET",
		"url":  "/auth/check",
		jquery.SUCCESS: func(rawdat string) {
			var dat struct {
				Success bool `json:"authenticated"`
			}
			json.Unmarshal([]byte(rawdat), &dat)

			if dat.Success {
				Connect()
			} else {
				data.AuthFail = true
				data.MessageContainerActive = false
				templates.Apply("login", "#container", "")
			}
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			fmt.Println("Reconnect failed: HTTP", info["status"])
			fmt.Println(info)
			time.AfterFunc(10*time.Second, Reconnect)
		},
	})
}

func errorr(evt *js.Object) {
	// TODO do something here?
}
