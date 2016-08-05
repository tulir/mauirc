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
			/* Original JS implementation:
			  receive(ed.object.id, ed.object.network, ed.object.channel, ed.object.timestamp,
				ed.object.sender, ed.object.command, ed.object.message, ed.object.ownmsg,
				ed.object.preview, true)
			*/
		}
	case messages.MsgCmdResponse:
		//msgData := messages.ParseCommandResponse(msg.Object)
		/* Original JS implementation:
		receiveCmdResponse(ed.object.message)
		*/
	case messages.MsgChanList:
		msgData := messages.ParseChanList(msg.Object)
		data.Networks.MustGet(msgData.Network).ChannelNames = msgData.List
	case messages.MsgChanData:
		//msgData := messages.ParseChanData(msg.Object)
		/* Original JS implementation:
		var channel = data.getChannel(ed.object.network, ed.object.name)
		channel.setTopicFull(ed.object.topic, ed.object.topicsetat, ed.object.topicsetby)
		channel.setUsers(ed.object.userlist)
		channel.setNotificationLevel("all")
		openChannel(ed.object.network, ed.object.name, false)

		if(getActiveNetwork() === ed.object.network && getActiveChannel() === ed.object.name) {
		  $("#title").text(ed.object.topic)
		  updateUserList()
		}
		*/
	case messages.MsgNetData:
		//msgData := messages.ParseNetData(msg.Object)
		/* Original JS implementation:
		if ($("#net-%s", ed.object.name.toLowerCase()).length === 0) {
		  openNetwork(ed.object.name)
		  settings.scripts.update(ed.object.name, false)
		}
		data.getNetwork(ed.object.name).setNetData(ed.object)
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
		//msgData := messages.ParseClearHistory(msg.Object)
		/* Original JS implementation:
		getChannel(ed.object.network, ed.object.channel).empty()
		*/
	case messages.MsgDelete:
		jq(fmt.Sprintf("#msgwrap-%s", msg.Object)).Remove()
	case messages.MsgWhois:
		msgData := messages.ParseWhoisData(msg.Object)
		ui.OpenWhoisModal(msgData)
	case messages.MsgInvite:
		//msgData := messages.ParseInvite(msg.Object)
		/* Original JS implementation:
		openChannel(ed.object.network, ed.object.channel, false)
		getChannel(ed.object.network, ed.object.channel).loadTemplate($("#template-invite"), {
		  sender: ed.object.sender,
		  channel: ed.object.channel,
		  accept: sprintf("acceptInvite('%s', '%s')", ed.object.network, ed.object.channel),
		  ignore: sprintf("closeChannel('%s', '%s')", ed.object.network, ed.object.channel)
		}, {append: false, isFile: false, async: false})
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
