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

// Package data contains the session data storage system
package data

import (
	"strings"
)

// NotificationLevel tells what messages should the user get notified about
type NotificationLevel int

// Values for NotificationLevel
const (
	NotificationNone       NotificationLevel = 0
	NotificationHighlights NotificationLevel = 1
	NotificationAll        NotificationLevel = 2
)

// ParseNotificationLevel parses a notification level from a string
func ParseNotificationLevel(str string) NotificationLevel {
	switch strings.ToLower(str) {
	case "all":
		return NotificationAll
	case "highlight":
		fallthrough
	case "highlights":
		return NotificationHighlights
	case "disabled":
		fallthrough
	case "none":
		fallthrough
	case "off":
		return NotificationNone
	default:
		return NotificationAll
	}
}
