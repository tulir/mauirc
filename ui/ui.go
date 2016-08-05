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
	"github.com/gopherjs/jquery"
)

var jq = jquery.NewJQuery

func init() {
	js.Global.Set("ui", map[string]interface{}{
		"autocomplete":        Autocomplete,
		"showModal":           ShowModal,
		"hideModal":           HideModal,
		"getActiveChannel":    GetActiveChannel,
		"getActiveNetwork":    GetActiveNetwork,
		"getActiveChannelObj": GetActiveChannelObj,
		"getActiveNetworkObj": GetActiveNetworkObj,
		"getChannel":          GetChannel,
		"getNetwork":          GetNetwork,
		"channelFilter":       ChannelFilter,
		"networkFilter":       NetworkFilter,
		"openChannelAdder":    OpenChannelAdder,
		"finishChannelAdding": FinishChannelAdding,
		"cancelChannelAdding": CancelChannelAdding,
	})
}
