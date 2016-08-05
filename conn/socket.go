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
	"github.com/gopherjs/websocket"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
)

var ws *websocket.WebSocket
var wsPath string

func init() {
	wsPath = "wss://" + js.Global.Get("window").Get("location").Get("host").String() + "/socket"
	if js.Global.Get("window").Get("location").Get("protocol").String() != "https:" {
		wsPath = "w" + wsPath[2:]
	}
}

// Connect to the socket
func Connect() {
	var err error
	ws, err = websocket.New(wsPath)
	if err != nil {
		panic(err)
	}

	ws.AddEventListener("open", false, open)
	ws.AddEventListener("message", false, message)
	ws.AddEventListener("close", false, close)
	ws.AddEventListener("error", false, errorr)
}

// Disconnect from the socket
func Disconnect() {
	err := ws.Close()
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
		/* Original JS implementation:
		var chanData = data.getChannel(ed.object.network, ed.object.channel)
		if (chanData.isFetchingHistory()) {
		  chanData.pushCache(ed.object)
		} else {
		  receive(ed.object.id, ed.object.network, ed.object.channel, ed.object.timestamp,
			ed.object.sender, ed.object.command, ed.object.message, ed.object.ownmsg,
			ed.object.preview, true)
		}
		*/
	case messages.MsgCmdResponse:
		/* Original JS implementation:
		receiveCmdResponse(ed.object.message)
		*/
	case messages.MsgChanList:
		/* Original JS implementation:
		data.getNetwork(ed.object.network).setChannels(ed.object.list)
		*/
	case messages.MsgChanData:
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
		//fmt.Println("Nick changed to", msg.Object.Nick, "on", msg.Object.Network)
		//data.Networks.Get(msg.Object.Network).Nick = msg.Object.Nick
	case messages.MsgClear:
		/* Original JS implementation:
		getChannel(ed.object.network, ed.object.channel).empty()
		*/
	case messages.MsgDelete:
		jq(fmt.Sprintf("#msgwrap-%s", msg.Object)).Remove()
	case messages.MsgWhois:
		/* Original JS implementation:
		openWhoisModal(ed.object)
		*/
	case messages.MsgInvite:
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
		/* Original JS implementation:
		$(sprintf("#raw-output-%s", ed.object.network)).append(sprintf("<div class='rawoutmsg'>%s</div>", ed.object.message))
		*/
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
		// TODO edit CheckAuth to work for reconnects too
		//time.AfterFunc(20*time.Second, reconnect)
	}
}

func errorr(evt *js.Object) {
	// TODO do something here?
}
