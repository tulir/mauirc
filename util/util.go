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
	"github.com/mvdan/xurls"
	"net/url"
)

// MarshalString marshals the given interface into JSON and stringifies the byte array result
func MarshalString(data interface{}) string {
	dat, _ := json.Marshal(&data)
	return string(dat)
}

// Linkify a string
func Linkify(msg string) string {
	return xurls.Relaxed.ReplaceAllStringFunc(msg, func(str string) string {
		u, _ := url.Parse(str)
		if len(u.Scheme) == 0 {
			u.Scheme = "http"
		}
		return "<a target='_blank' href='" + u.String() + "'>" + str + "</a>"
	})
}
