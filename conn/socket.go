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
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/websocket"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"time"
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

func reconnect() {

}

func open(evt *js.Object) {
	templates.Apply("main", "#container", nil)
	jq("#disconnected").AddClass("hidden")
	data.Connected = true
}

func message(evt *js.Object) {

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
		time.AfterFunc(20*time.Second, reconnect)
	}
}

func errorr(evt *js.Object) {

}
