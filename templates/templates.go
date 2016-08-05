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
	"html/template"
)

var jq = jquery.NewJQuery
var tmpl = template.New("root")

// LoadAll loads all the default templates
func LoadAll() {
	Load("action")
	Load("channel-adder")
	Load("channel")
	Load("channel-switcher")
	Load("error")
	Load("image-modal")
	Load("index")
	Load("invite")
	Load("login")
	Load("main")
	Load("message")
	Load("message-preview-both")
	Load("message-preview-image")
	Load("message-preview-text")
	Load("network")
	Load("network-switcher")
	Load("oper")
	Load("rawio")
	Load("settings")
	Load("settings-main")
	Load("settings-networks")
	Load("settings-scripts")
	Load("settings-list-entry")
	Load("title-editor")
	Load("userlist-entry")
	Load("userlist-invite-box")
	Load("userlist-invite")
	Load("whois")
}

// Load the template with the given name
func Load(name string) *template.Template {
	templ := tmpl.New(name)
	templ.Parse(jq(fmt.Sprintf("#template-%s", name)).Html())
	return templ
}

// Apply the template with the given name and the given args to the given object
func Apply(name, target string, args interface{}) {
	var buf bytes.Buffer
	tmpl.ExecuteTemplate(&buf, name, args)
	jq(target).SetHtml(buf.String())
}

// Append the template with the given name and the given args to the given object
func Append(name, target string, args interface{}) {
	var jqtarget = jq(target)

	var buf bytes.Buffer
	buf.WriteString(jqtarget.Html())
	tmpl.ExecuteTemplate(&buf, name, args)

	jq(target).SetHtml(buf.String())
}
