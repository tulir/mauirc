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

// Package console contains bindings for the JavaScript console
package console

import (
	"github.com/gopherjs/gopherjs/js"
)

var console = js.Global.Get("console")

// Log calls console.log with the given arguments
func Log(msg ...interface{}) {
	console.Call("log", msg...)
}

// Info calls console.info with the given arguments
func Info(msg ...interface{}) {
	console.Call("info", msg...)
}

// Warn calls console.warn with the given arguments
func Warn(msg ...interface{}) {
	console.Call("warn", msg...)
}

// Error calls console.error with the given arguments
func Error(msg ...interface{}) {
	console.Call("error", msg...)
}

// Trace calls console.trace
func Trace() {
	console.Call("trace")
}
