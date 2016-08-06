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
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
)

// CloseRawIO closes the raw io panel
func CloseRawIO() {
	jq("#raw-io").AddClass("hidden")
	jq("#raw-io > :not(.hidden)").AddClass("hidden")
}

// OpenRawIO opens the raw io panel
func OpenRawIO(network string) {
	if len(network) == 0 {
		return
	}

	jq("#raw-io").RemoveClass("hidden")
	jq(fmt.Sprintf("#raw-io-%s", NetworkFilter(network))).RemoveClass("hidden")
}

// SendRaw sends the message in the raw io input box
func SendRaw(net string) {
	field := jq(fmt.Sprintf("#raw-input-field-%s", net))
	data.Messages <- messages.Container{
		Type: messages.MsgRaw,
		Object: messages.RawMessage{
			Network: net,
			Message: field.Val(),
		},
	}
	jq(fmt.Sprintf("#raw-output-%s", net)).Append(fmt.Sprintf("<div class='rawoutmsg rawownmsg'>--> %s</div>", field.Val()))
	field.SetVal("")
}

// CreateRawIO creates a raw io box for the given network
func CreateRawIO(network string) {
	templates.Append("rawio", "#raw-io", network)
}
