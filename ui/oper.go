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

// OperSend sends oper authentication to the server
func OperSend() {
	data.Messages <- messages.Container{
		Type: messages.MsgRaw,
		Object: messages.RawMessage{
			Network: jq("#oper-auth-form").Attr("data-network"),
			Message: fmt.Sprintf("OPER %s %s", jq("#oper-username").Val(), jq("#oper-password").Val()),
		},
	}
}

// OpenOper opens the OPER authentication modal
func OpenOper(network string) {
	templates.Apply("oper", "#modal", network)
	ShowModal()
}
