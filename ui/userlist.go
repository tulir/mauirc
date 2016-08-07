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
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
)

// UpdateUserlist updates the userlist contents
func UpdateUserlist() {
	chanData := data.GetChannel(GetActiveNetwork(), GetActiveChannel())
	if chanData == nil || len(chanData.Userlist) == 0 {
		if !IsUserlistHidden() {
			ToggleUserlist(false)
		}
		jq("#open-user-list").AddClass("hidden-medium-down")
		jq("#open-settings").RemoveClass("hidden-medium-down")
		return
	}

	if IsUserlistHidden() && !WasUserlistHiddenManually() {
		ToggleUserlist(false)
	}
	userlistObj := jq("#userlist-list")
	userlistObj.SetText("")
	for i, user := range chanData.Userlist {
		templates.AppendObj("userlist-entry", userlistObj, map[string]interface{}{
			"Network":     GetActiveNetwork(),
			"Name":        chanData.UserlistPlain[i],
			"DisplayName": user,
		})
	}

	templates.AppendObj("userlist-invite", userlistObj, nil)
	jq("#open-user-list").RemoveClass("hidden-medium-down")
	jq("#open-settings").AddClass("hidden-medium-down")
}

// StartInvite opens the invite box
func StartInvite() {
	jq("#userlist-invite").Remove()
	templates.Append("userlist-invite-box", "#userlist-list", nil)
	jq("#userlist-invite-box").Focus()
}

// StopInvite closes the invite box
func StopInvite() {
	jq("#userlist-invite-box").Remove()
	templates.Append("userlist-invite", "#userlist-list", nil)
}

// FinishInvite invites the person given and closes the invite box
func FinishInvite() {
	data.Messages <- messages.Container{
		Type: messages.MsgMessage,
		Object: messages.Message{
			Network: GetActiveNetwork(),
			Channel: GetActiveChannel(),
			Command: "invite",
			Message: jq("#userlist-invite-box").Val(),
		},
	}
	StopInvite()
}

// AcceptInvite accepts an invite
func AcceptInvite(network, channel string) {
	GetChannel(network, channel).Empty()

	chanData := data.MustGetChannel(network, channel)
	if !chanData.HistoryFetched {
		//history(network, channel, 512) TODO
	}

	data.Messages <- messages.Container{
		Type: "message",
		Object: messages.Message{
			Network: network,
			Channel: channel,
			Command: "join",
			Message: "Joining",
		},
	}
}

// IsUserlistHidden checks if the userlist is currently hidden by user action or lack of content
func IsUserlistHidden() bool {
	return jq("#userlist").HasClass("hidden")
}

// WasUserlistHiddenManually checks if the userlist was hidden by the user
func WasUserlistHiddenManually() bool {
	return jq("userlist").HasClass("hidden-manual")
}

// ToggleUserlist opens or closes the userlist based on its current state
func ToggleUserlist(manual bool) {
	userlist := jq("#userlist")
	if userlist.HasClass("hidden") {
		userlist.RemoveClass("hidden")
		userlist.RemoveClass("hidden-manual")
		jq("#messaging").RemoveClass("messaging-userlisthidden")
	} else {
		userlist.AddClass("hidden")
		if manual {
			userlist.AddClass("hidden-manual")
		}
		jq("#messaging").AddClass("messaging-userlisthidden")
	}
}
