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
	"maunium.net/go/gopher-mousetrap"
)

func init() {
	mousetrap.Bind("mod+e r", func() {
		if jq("#raw-io").HasClass("hidden") {
			OpenRawIO(GetActiveNetwork())
		} else {
			CloseRawIO()
		}
	})

	mousetrap.Bind("mod+e n", func() {
		net := GetActiveNetwork()
		if len(net) > 0 {
			OpenChannelAdder(net)
		}
	})

	mousetrap.Bind("mod+e p", func() {
		PartActiveChannel()
	})

	mousetrap.Bind("up up down down left right left right b a", func() {
		js.Global.Call("alert", "Sorry, I haven't made an easter egg yet :/")
	})
}
