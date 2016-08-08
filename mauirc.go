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
package main

import (
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc/conn"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util/console"
)

var jq = jquery.NewJQuery

func main() {
	console.Info("mauIRC", data.Version, "loading...")

	console.Log("Loading templates")
	templates.LoadAll()

	console.Log("Checking notification permission")
	js.Global.Get("Notification").Call("requestPermission")

	console.Log("Applying templates")
	templates.Apply("login", "#container", nil)
	templates.Apply("settings", "#settings", nil)

	console.Info("Init done")

	conn.CheckAuth()
}
