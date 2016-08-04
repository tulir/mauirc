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

// Package util contains utilities
package util

import (
	"encoding/json"
)

// WebError is a wrapper for errors intended to be sent to HTTP clients
type WebError struct {
	HTTP      int    `json:"http"`
	Simple    string `json:"error"`
	Human     string `json:"error-humanreadable"`
	ExtraInfo string `json:"error-extrainfo,omitempty"`
}

// MarshalString marshals the given interface into JSON and stringifies the byte array result
func MarshalString(data interface{}) string {
	dat, _ := json.Marshal(&data)
	return string(dat)
}
