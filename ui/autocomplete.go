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
	"maunium.net/go/mauirc/data"
	"strings"
)

// Autocomplete things
func Autocomplete() {
	msgbox := jq("#message-text")
	text := msgbox.Val()
	caretPos := msgbox.Underlying().Index(0).Get("selectionStart").Int()

	spIndex := strings.LastIndex(text[:caretPos], " ")
	if spIndex == caretPos-1 {
		return
	}

	word := text[spIndex+1 : caretPos]
	if word[0] == '/' {
		// TODO command autocomplete
	} else {
		for _, user := range data.MustGetChannel(GetActiveNetwork(), GetActiveChannel()).UserlistPlain {
			if strings.HasPrefix(strings.ToLower(user), word) {
				if spIndex == -1 {
					msgbox.SetVal(fmt.Sprintf("%s: %s", user, text[caretPos:]))
				} else {
					msgbox.SetVal(fmt.Sprintf("%s %s %s", text[:spIndex], user, text[caretPos:]))
				}
				return
			}
		}
	}
}
