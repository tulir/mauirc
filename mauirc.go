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
	"fmt"
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc/auth"
	"maunium.net/go/mauirc/templates"
)

// VERSION of mauIRC
const VERSION = "2.0.0"

var jq = jquery.NewJQuery

func main() {
	fmt.Println("mauIRC", VERSION, "loading...")

	fmt.Println("Loading templates")
	templates.LoadAll()

	fmt.Println("Checking notification permission")
	js.Global.Get("Notification").Call("requestPermission")

	fmt.Println("Applying templates")
	templates.Apply("login", "#container", nil)
	templates.Apply("settings", "#settings", nil)

	fmt.Println("Init done")

	auth.Check()
}
