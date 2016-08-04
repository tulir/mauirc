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
	"bytes"
	"fmt"
	"html/template"
)

// LoadTemplates loads all the default templates
func LoadTemplates() {
	LoadTemplate("action")
	LoadTemplate("channel-adder")
	LoadTemplate("channel")
	LoadTemplate("channel-switcher")
	LoadTemplate("error")
	LoadTemplate("image-modal")
	LoadTemplate("index")
	LoadTemplate("invite")
	LoadTemplate("login")
	LoadTemplate("main")
	LoadTemplate("message")
	LoadTemplate("message-preview-both")
	LoadTemplate("message-preview-image")
	LoadTemplate("message-preview-text")
	LoadTemplate("network")
	LoadTemplate("network-switcher")
	LoadTemplate("oper")
	LoadTemplate("rawio")
	settings := LoadTemplate("settings")
	LoadTemplateInto(settings, "networks")
	LoadTemplateInto(settings, "scripts")
	LoadTemplate("settings-list-entry")
	LoadTemplate("title-editor")
	LoadTemplate("userlist-entry")
	LoadTemplate("userlist-invite-box")
	LoadTemplate("userlist-invite")
	LoadTemplate("whois")
}

// LoadTemplate loads the template with the given name
func LoadTemplate(name string) *template.Template {
	templ := tmpl.New(name)
	templ.Parse(jq(fmt.Sprintf("#template-%s", name)).Html())
	return templ
}

// LoadTemplateInto ...
func LoadTemplateInto(tmpl *template.Template, name string) *template.Template {
	templ := tmpl.New(name)
	templ.Parse(jq(fmt.Sprintf("#template-%s-%s", tmpl.Name(), name)).Html())
	return templ
}

// ApplyTemplate applies the template with the given name and the given args to the given object
func ApplyTemplate(name, target string, args interface{}) {
	var buf bytes.Buffer
	tmpl.ExecuteTemplate(&buf, name, args)
	jq(target).SetHtml(buf.String())
}
