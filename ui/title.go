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
	"time"
)

var titleEditClick int64

// StartTitleEdit opens the title editor
func StartTitleEdit() {
	if jq("#title-editor").Length != 0 {
		return
	}

	now := time.Now().UnixNano()
	if now-titleEditClick <= 500000000 {
		templates.Apply("title-editor", "#title", jq("#title").Text())
		jq("#title-editor").Focus()
		titleEditClick = 0
	} else {
		titleEditClick = 0
	}
}

// StopTitleEdit stops editing the title
func StopTitleEdit() {
	jq("#title").SetText(jq("#title-editor").Attr("data-old-text"))
}

// FinishTitleEdit finishes editing the title
func FinishTitleEdit() {
	data.Messages <- messages.Container{
		Type: messages.MsgMessage,
		Object: messages.Message{
			Network: GetActiveNetwork(),
			Channel: GetActiveChannel(),
			Command: "topic",
			Message: jq("#title-editor").Val(),
		},
	}
	StopTitleEdit()
}
