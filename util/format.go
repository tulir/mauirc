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
	"fmt"
	"regexp"
	"strings"
)

var italicEncRegex = regexp.MustCompile("_([^_]*)_")
var boldEncRegex = regexp.MustCompile("\\*([^\\*]*)\\*")
var underlineEncRegex = regexp.MustCompile("~([^~]*)~")
var bothColorEncRegex = regexp.MustCompile("c(1[0-5]|[0-9])>([^<]*)<")
var fgColorEncRegex = regexp.MustCompile("c(1[0-5]|[0-9]),(1[0-5]|[0-9])>([^<]*)<")

// EncodeMessage encodes the message markdown-ish styles and colors into IRC format
func EncodeMessage(msg string) string {
	msg = italicEncRegex.ReplaceAllString(msg, "\x1D$1\x1D")
	msg = boldEncRegex.ReplaceAllString(msg, "\x02$1\x02")
	msg = underlineEncRegex.ReplaceAllString(msg, "\x1F$1\x1F")
	msg = bothColorEncRegex.ReplaceAllString(msg, "\x03$1$2")
	msg = fgColorEncRegex.ReplaceAllString(msg, "\x03$1,$2$3")
	return msg
}

var colors = []string{
	"#FFFFFF",
	"#000000",
	"#00007F",
	"#009300",
	"#FF0000",
	"#7F0000",
	"#9C009C",
	"#FC7F00",
	"#FFFF00",
	"#00FC00",
	"#009393",
	"#00FFFF",
	"#0000FC",
	"#FF00FF",
	"#7F7F7F",
	"#D2D2D2",
}

var italicDecRegex = regexp.MustCompile("\x1D([^\x1D]*)?\x1D?")
var boldDecRegex = regexp.MustCompile("\x02([^\x02]*)?\x02?")
var underlineDecRegex = regexp.MustCompile("\x1F([^\x1F]*)?\x1F?")
var bothColorDecRegex = regexp.MustCompile("\x03(1[0-5]|[0-9]),(1[0-5]|[0-9])([^\x03]*)?\x03?")
var fgColorDecRegex = regexp.MustCompile("\x03(1[0-5]|[0-9])([^\x03]*)?\x03?")

// DecodeMessage decodes the IRC styles and colors into a markdown-ish format
func DecodeMessage(msg string) string {
	msg = italicDecRegex.ReplaceAllString(msg, "<i>$1</i>")
	msg = boldDecRegex.ReplaceAllString(msg, "<b>$1</b>")
	msg = underlineDecRegex.ReplaceAllString(msg, "<u>$1</u>")
	msg = bothColorDecRegex.ReplaceAllString(msg, "<span style='color: $1; background-color: $2;'>$3</span>")
	msg = fgColorDecRegex.ReplaceAllString(msg, "<span style='color: $1;'>$2</span>")

	for i, color := range colors {
		msg = strings.Replace(msg, fmt.Sprintf("color: %d;", i), fmt.Sprintf("#color: %s;", color), -1)
	}

	return msg
}

var removeFormatRegex = regexp.MustCompile("\x1D|\x02|\x1F|\x03")

// RemoveFormatChars removes all IRC format characters
func RemoveFormatChars(msg string) string {
	return removeFormatRegex.ReplaceAllString(msg, "")
}
