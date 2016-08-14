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
	"fmt"
	"github.com/gopherjs/gopherjs/js"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util/console"
)

// ContextMessage shows the context menu for a message
func ContextMessage(event *js.Object, id int64) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Delete Message": fmt.Sprintf("ui.contextmenu.click.message('delete', '%d')", id),
		"Copy Text":      fmt.Sprintf("ui.contextmenu.click.message('copy', '%d')", id),
	})
	ShowContextMenu(event)
}

// ContextMessageClick ...
func ContextMessageClick(command string, id int64) {
	switch command {
	case "delete":
		data.Messages <- messages.Container{
			Type:   messages.MsgDelete,
			Object: messages.DeleteMessage(id),
		}
	case "copy":
		thisObj := jq(fmt.Sprintf("#msg-%d", id))
		textObj := thisObj.Find(".message-text")
		if textObj.Length == 0 {
			textObj = thisObj.Find(".clipboard-data")
			if textObj.Length == 0 {
				console.Warn("Failed to copy to clipboard: Text not found!")
				return
			}
		}

		wasHidden := false
		if textObj.HasClass("hidden") {
			wasHidden = true
			textObj.RemoveClass("hidden")
		}

		selection := js.Global.Get("window").Call("getSelection")
		rangee := js.Global.Get("document").Call("createRange")
		rangee.Call("selectNodeContents", textObj.Underlying().Index(0))
		selection.Call("removeAllRanges")
		selection.Call("addRange", rangee)
		js.Global.Get("document").Call("execCommand", "copy")
		selection.Call("removeAllRanges")

		if wasHidden {
			textObj.AddClass("hidden")
		}
	}
}

// ContextChannelSwitcher shows the context menu for a channel switcher
func ContextChannelSwitcher(event *js.Object, network, channel string) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Clear History": fmt.Sprintf("ui.settings.clearHistory('%s', '%s')", network, channel),
		"Part Channel":  fmt.Sprintf("ui.settings.partChannel('%s', '%s')", network, channel),
	})
	ShowContextMenu(event)
}

// ContextNetworkSwitcher shows the context menu for a network switcher
func ContextNetworkSwitcher(event *js.Object, network string) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Raw IO":           fmt.Sprintf("ui.rawio.open('%s')", network),
		"Oper Auth":        fmt.Sprintf("ui.oper.open('%s')", network),
		"Connect":          fmt.Sprintf("ui.contextmenu.click.networkSwitcher('connect', '%s')", network),
		"Disconnect":       fmt.Sprintf("ui.contextmenu.click.networkSwitcher('disconnect', '%s')", network),
		"Force Disconnect": fmt.Sprintf("ui.contextmenu.click.networkSwitcher('forcedisconnect', '%s')", network),
	})
	ShowContextMenu(event)
}

// ContextNetworkSwitcherClick ...
func ContextNetworkSwitcherClick(command, network string) {
	// TODO implement with new network editing scheme
}

// ContextUserlistEntry shows the context menu for an userlist entry
func ContextUserlistEntry(event *js.Object, network, user string) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Open Query": fmt.Sprintf("ui.openPM('%s', '%s')", network, user),
		"Whois":      fmt.Sprintf("ui.contextmenu.click.networkSwitcher('whois', '%s', '%s')", network, user),
		"Give OP":    fmt.Sprintf("ui.contextmenu.click.networkSwitcher('op', '%s', '%s')", network, user),
		"Take OP":    fmt.Sprintf("ui.contextmenu.click.networkSwitcher('deop', '%s', '%s')", network, user),
		"Kick":       fmt.Sprintf("ui.contextmenu.click.networkSwitcher('kick', '%s', '%s')", network, user),
		"Ban":        fmt.Sprintf("ui.contextmenu.click.networkSwitcher('ban', '%s', '%s')", network, user),
	})
	ShowContextMenu(event)
}

// ContextUserlistEntryClick ...
func ContextUserlistEntryClick(command, network, user string) {
	switch command {
	case "whois":
		data.Messages <- messages.Container{
			Type: messages.MsgMessage,
			Object: messages.Message{
				Network: GetActiveNetwork(),
				Channel: user,
				Command: "whois",
				Message: "whois",
			},
		}
	case "op":
		data.Messages <- messages.Container{
			Type: messages.MsgMode,
			Object: messages.Mode{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				Message: fmt.Sprintf("+o %s", user),
			},
		}
	case "deop":
		data.Messages <- messages.Container{
			Type: messages.MsgMode,
			Object: messages.Mode{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				Message: fmt.Sprintf("-o %s", user),
			},
		}
	case "kick":
		data.Messages <- messages.Container{
			Type: messages.MsgKick,
			Object: messages.Kick{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				User:    user,
				Message: "Get out",
			},
		}
	}
}

// ShowContextMenu shows the context menu
func ShowContextMenu(event *js.Object) {
	event.Call("stopPropagation")
	event.Call("preventDefault")
	jq("#contextmenu").SetCss(map[string]interface{}{
		"top":  event.Get("pageY").Int(),
		"left": event.Get("pageX").Int(),
	})
	jq("#contextmenu").RemoveClass("hidden")
}

// HideContextMenu hides the context menu
func HideContextMenu() {
	jq("#contextmenu").AddClass("hidden")
	jq("#contextmenu").Empty()
}
