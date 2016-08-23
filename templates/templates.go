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

// Package templates contains the template loader and applier
package templates

import (
	"bytes"
	"fmt"
	"github.com/gopherjs/jquery"
	"text/template"
)

var jq = jquery.NewJQuery
var tmpl = template.New("root")

// LoadAll loads all the default templates
func LoadAll() {
	Load("channel-adder")
	Load("channel-switcher")
	Load("channel")
	Load("contextmenu")
	Load("error")
	Load("image-modal")
	Load("index")
	Load("invite")
	Load("login")
	Load("main")
	Load("message")
	Load("network")
	Load("network-switcher")
	Load("oper")
	Load("rawio")
	Load("settings")
	Load("settings-main")
	Load("settings-networks")
	Load("settings-scripts")
	Load("settings-list-entry")
	Load("settings-object-adder")
	Load("title-editor")
	Load("userlist-entry")
	Load("userlist-invite-box")
	Load("userlist-invite")
	Load("whois")
}

// Load the template with the given name
func Load(name string) *template.Template {
	templ := tmpl.New(name)
	_, err := templ.Parse(jq(fmt.Sprintf("#template-%s", name)).Html())
	if err != nil {
		fmt.Println(err)
	}
	return templ
}

// Apply the template with the given name and the given args to the given object
func Apply(name, target string, args interface{}) {
	ApplyObj(name, jq(target), args)
}

// Append the template with the given name and the given args to the given object
func Append(name, target string, args interface{}) {
	AppendObj(name, jq(target), args)
}

// ApplyObj applies the template with the given name to the given object
func ApplyObj(name string, obj jquery.JQuery, args interface{}) {
	dat, err := ApplyString(name, args)
	if err != nil {
		fmt.Println(err)
	}
	obj.SetHtml(dat)
}

// AppendObj appends the template with the given name to the given object
func AppendObj(name string, obj jquery.JQuery, args interface{}) {
	dat, err := ApplyString(name, args)
	if err != nil {
		fmt.Println(err)
	}
	obj.Append(dat)
}

// ApplyString executes the template into a string and returns the string
func ApplyString(name string, args interface{}) (string, error) {
	var buf bytes.Buffer
	err := tmpl.ExecuteTemplate(&buf, name, args)
	return buf.String(), err
}
