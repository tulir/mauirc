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
	"github.com/dustin/go-humanize"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/templates"
	"time"
)

// OpenWhoisModal opens the WHOIS data modal
func OpenWhoisModal(data messages.WhoisData) {
	if data.IdleTime == 0 {
		data.Idle = "Currently online"
	} else {
		data.Idle = humanize.Time(time.Unix(data.IdleTime, 0))
	}

	templates.Apply("whois", "#modal", data)
	if len(data.Away) == 0 {
		jq("#whois-data-awaymessage").Remove()
	}

	ShowModal()
}
