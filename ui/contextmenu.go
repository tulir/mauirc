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
	"maunium.net/go/mauirc/templates"
)

// ContextMessage shows the context menu for a message
func ContextMessage(x, y int, id int64) {
	templates.Apply("contextmenu", "#contextmenu", map[string]map[string]string{
		"Delete Message": map[string]string{
			"OnClick": fmt.Sprintf("ui.contextmenu.click.message.delete('%d')", id),
		},
		"Copy Text": map[string]string{
			"OnClick": fmt.Sprintf("ui.contextmenu.click.message.copy('%d')", id),
		},
	})
	ShowContextMenu(x, y)
}

// ContextChannelSwitcher shows the context menu for a channel switcher
func ContextChannelSwitcher(network, channel string) {

}

// ContextNetworkSwitcher shows the context menu for a network switcher
func ContextNetworkSwitcher(network string) {

}

// ContextUserlistEntry shows the context menu for an userlist entry
func ContextUserlistEntry(network, user string) {

}

// ShowContextMenu shows the context menu
func ShowContextMenu(x, y int) {
	jq("#contextmenu").SetCss(map[string]interface{}{
		"top":  y,
		"left": x,
	})
	jq("#contextmenu").RemoveClass("hidden")
}

// HideContextMenu hides the context menu
func HideContextMenu() {
	jq("#contextmenu").AddClass("hidden")
	jq("#contextmenu").Empty()
}
