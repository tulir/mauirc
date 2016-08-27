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
	"github.com/gopherjs/jquery"
)

var jq = jquery.NewJQuery

func init() {
	js.Global.Set("ui", map[string]interface{}{
		"messagebox": map[string]interface{}{
			"autocomplete": Autocomplete,
			"send":         Send,
		},
		"modal": map[string]interface{}{
			"show": ShowModal,
			"hide": HideModal,
		},
		"userlist": map[string]interface{}{
			"update":            UpdateUserlist,
			"isHidden":          IsUserlistHidden,
			"wasHiddenManually": WasUserlistHiddenManually,
			"toggle":            ToggleUserlist,
		},
		"view": map[string]interface{}{
			"userlist": OpenUserlistView,
			"message":  OpenMessageView,
			"networks": OpenNetworksView,
		},
		"invite": map[string]interface{}{
			"start":  StartInvite,
			"stop":   StopInvite,
			"finish": FinishInvite,
			"accept": AcceptInvite,
		},
		"rawio": map[string]interface{}{
			"open":   OpenRawIO,
			"close":  CloseRawIO,
			"create": CreateRawIO,
			"send":   SendRaw,
		},
		"channels": map[string]interface{}{
			"open":         OpenChannel,
			"close":        CloseChannel,
			"get":          GetChannel,
			"switch":       SwitchTo,
			"clear":        SwitchToClear,
			"finishAdding": FinishChannelAdding,
			"cancelAdding": CancelChannelAdding,
		},
		"contextmenu": map[string]interface{}{
			"message":         ContextMessage,
			"channel":         ContextChannel,
			"channelSwitcher": ContextChannelSwitcher,
			"networkSwitcher": ContextNetworkSwitcher,
			"userlistEntry":   ContextUserlistEntry,
			"hide":            HideContextMenu,
			"show":            ShowContextMenu,
			"click": map[string]interface{}{
				"message":         ContextMessageClick,
				"networkSwitcher": ContextNetworkSwitcherClick,
				"userlistEntry":   ContextUserlistEntryClick,
			},
		},
		"oper": map[string]interface{}{
			"send": OperSend,
			"open": OpenOper,
		},
		"title": map[string]interface{}{
			"edit":   StartTitleEdit,
			"stop":   StopTitleEdit,
			"finish": FinishTitleEdit,
		},
		"settings": map[string]interface{}{
			"open":               OpenSettings,
			"close":              CloseSettings,
			"updateValues":       UpdateValues,
			"clearHistory":       ClearHistory,
			"partChannel":        PartChannel,
			"clearActiveHistory": ClearActiveHistory,
			"partActiveChannel":  PartActiveChannel,
			"change": map[string]interface{}{
				"notifications": OnChangeNotifications,
				"font":          OnChangeFont,
				"highlights":    OnChangeHighlights,
				"nick":          OnChangeNick,
			},
			"networks": map[string]interface{}{
				"open":   OpenNetworkEditor,
				"close":  CloseNetworkEditor,
				"switch": SwitchNetwork,
				"new": map[string]interface{}{
					"start":  StartNewNetwork,
					"cancel": CancelNewNetwork,
					"finish": FinishNewNetwork,
				},
				"delete": DeleteNetwork,
				"save":   SaveNetwork,
			},
			"scripts": map[string]interface{}{
				"open":   OpenScriptEditor,
				"close":  CloseScriptEditor,
				"switch": SwitchScript,
				"new": map[string]interface{}{
					"start":  StartNewScript,
					"cancel": CancelNewScript,
					"finish": FinishNewScript,
				},
				"delete": DeleteScript,
				"rename": RenameScript,
				"save":   SaveScript,
			},
		},
		"getHistory":          GetHistory,
		"getActiveChannel":    GetActiveChannel,
		"getActiveNetwork":    GetActiveNetwork,
		"getActiveChannelObj": GetActiveChannelObj,
		"getActiveNetworkObj": GetActiveNetworkObj,
		"getNetwork":          GetNetwork,
		"channelFilter":       ChannelFilter,
		"networkFilter":       NetworkFilter,
		"openChannelAdder":    OpenChannelAdder,
		"openFullImageModal":  OpenFullImageModal,
		"openPM":              OpenPM,
	})
}

// ScrollDown scrolls the message pane to the bottom
func ScrollDown() {
	jq("#messages").SetScrollTop(jq("#messages").Underlying().Index(0).Get("scrollHeight").Int())
}

// SendNotification sends a notification to the desktop
func SendNotification(net, ch, user, message string) {
	if js.Global.Get("Notification").Get("permission").String() == "granted" {
		notif := js.Global.Get("Notification").New(fmt.Sprintf("%s @ %s", user, ch), map[string]interface{}{"body": message, "icon": "/res/favicon.ico"})
		notif.Set("onclick", func() {
			SwitchTo(net, ch)
		})
	}
}
