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

// Package ui contains UI-related functions
package ui

import (
	"github.com/gopherjs/gopherjs/js"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"strings"
)

// OpenSettings opens the settings view
func OpenSettings() {
	UpdateValues()
	jq("#settings").RemoveClass("hidden")
	jq("#container").AddClass("hidden")
}

// CloseSettings closes the settings view
func CloseSettings() {
	UpdateValues()
	jq("#settings").AddClass("hidden")
	jq("#container").RemoveClass("hidden")
}

// UpdateValues updates values within the settings view
func UpdateValues() {
	jq("#network-nickname").SetVal("")
	jq("#network-highlights").SetVal("")
	jq("#channel-notifications").SetVal("all")

	font := js.Global.Get("document").Get("body").Get("style").Get("fontFamily")
	if font == nil || font.Length() == 0 {
		jq("#mauirc-font").SetVal("Raleway")
	} else {
		jq("#mauirc-font").SetVal(font.String())
	}

	if !data.NetworkExists(GetActiveNetwork()) {
		return
	}
	net := data.MustGetNetwork(GetActiveNetwork())
	jq("#network-nickname").SetVal(net.Nick)
	jq("#network-highlights").SetVal(net.Highlights.String())

	if !net.ChannelExists(GetActiveChannel()) {
		return
	}

	ch := net.MustGetChannel(GetActiveChannel())
	jq("#channel-notifications").SetVal(ch.Notifications.String())
}

// OnChangeNotifications updates the notification level in the data store
func OnChangeNotifications() {
	data.MustGetChannel(GetActiveNetwork(), GetActiveChannel()).Notifications = data.ParseNotificationLevel(jq("#channel-notifications").Val())
}

// OnChangeHighlights updates the highlights in the data store
func OnChangeHighlights() {
	data.MustGetNetwork(GetActiveNetwork()).Highlights.Parse(jq("#network-highlights").Val())
}

// OnChangeNick updates the IRC nick
func OnChangeNick() {
	nick := strings.TrimSpace(jq("#network-nickname").Val())
	if len(nick) == 0 {
		return
	}

	data.Messages <- messages.Container{
		Type: messages.MsgMessage,
		Object: messages.Message{
			Network: GetActiveNetwork(),
			Channel: GetActiveChannel(),
			Command: "nick",
			Message: nick,
		},
	}
}

// OnChangeFont changes the website font
func OnChangeFont() {
	js.Global.Get("document").Get("body").Get("style").Set("fontFamily", jq("#mauirc-font").Val())
}

// ClearHistory clears the history
func ClearHistory() {
	data.Messages <- messages.Container{
		Type: messages.MsgClear,
		Object: messages.ClearHistory{
			Network: GetActiveNetwork(),
			Channel: GetActiveChannel(),
		},
	}
	CloseSettings()
}

// PartChannel leaves the channel
func PartChannel() {
	if GetActiveChannel()[0] == '#' {
		data.Messages <- messages.Container{
			Type: messages.MsgMessage,
			Object: messages.Message{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				Command: "part",
				Message: "Leaving",
			},
		}
	} else {
		data.Messages <- messages.Container{
			Type: messages.MsgClose,
			Object: messages.ClearHistory{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
			},
		}
	}
	CloseChannel(GetActiveNetwork(), GetActiveChannel())
	CloseSettings()
}
