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
	"maunium.net/go/mauirc/templates"
)

// ContextMessage shows the context menu for a message
func ContextMessage(event *js.Object, id int64) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Delete Message": fmt.Sprintf("ui.contextmenu.click.message.delete('%d')", id),
		"Copy Text":      fmt.Sprintf("ui.contextmenu.click.message.copy('%d')", id),
	})
	ShowContextMenu(event)
}

// ContextChannelSwitcher shows the context menu for a channel switcher
func ContextChannelSwitcher(event *js.Object, network, channel string) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Clear History": fmt.Sprintf("ui.contextmenu.click.channelSwitcher.clear('%s', '%s')", network, channel),
		"Part Channel":  fmt.Sprintf("ui.contextmenu.click.channelSwitcher.part('%s', '%s')", network, channel),
	})
	ShowContextMenu(event)
}

// ContextNetworkSwitcher shows the context menu for a network switcher
func ContextNetworkSwitcher(event *js.Object, network string) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Raw IO":           fmt.Sprintf("ui.contextmenu.click.networkSwitcher.rawIO('%s')", network),
		"Oper Auth":        fmt.Sprintf("ui.contextmenu.click.networkSwitcher.operAuth('%s')", network),
		"Connect":          fmt.Sprintf("ui.contextmenu.click.networkSwitcher.connect('%s')", network),
		"Disconnect":       fmt.Sprintf("ui.contextmenu.click.networkSwitcher.disconnect('%s')", network),
		"Force Disconnect": fmt.Sprintf("ui.contextmenu.click.networkSwitcher.forceDisonnect('%s')", network),
	})
	ShowContextMenu(event)
}

// ContextUserlistEntry shows the context menu for an userlist entry
func ContextUserlistEntry(event *js.Object, network, user string) {
	templates.Apply("contextmenu", "#contextmenu", map[string]string{
		"Open Query": fmt.Sprintf("ui.contextmenu.click.networkSwitcher.openQuery('%s', '%s')", network, user),
		"Whois":      fmt.Sprintf("ui.contextmenu.click.networkSwitcher.whois('%s', '%s')", network, user),
		"Give OP":    fmt.Sprintf("ui.contextmenu.click.networkSwitcher.giveOp('%s', '%s')", network, user),
		"Take OP":    fmt.Sprintf("ui.contextmenu.click.networkSwitcher.takeOp('%s', '%s')", network, user),
		"Kick":       fmt.Sprintf("ui.contextmenu.click.networkSwitcher.kick('%s', '%s')", network, user),
		"Ban":        fmt.Sprintf("ui.contextmenu.click.networkSwitcher.ban('%s', '%s')", network, user),
	})
	ShowContextMenu(event)
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
