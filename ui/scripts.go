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

// Package ui contains UI-related functions
package ui

import (
	"fmt"
	"maunium.net/go/gopher-ace"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
)

// Global is the global network name
const Global = "global"

var scripteditor ace.Editor

// OpenScriptEditor opens the script editor
func OpenScriptEditor(net string) {
	var scripts data.ScriptStore
	if net == "global" {
		scripts = data.GlobalScripts
	} else {
		scripts = data.MustGetNetwork(net).Scripts
	}

	jq("#settings-main").AddClass("hidden")
	jq("#settings-networks").AddClass("hidden")
	jq("#settings-scripts").RemoveClass("hidden")

	scripteditor = ace.Edit("script-editor")
	scripteditor.SetOptions(map[string]interface{}{
		"fontFamily": "Fira Code",
		"fontSize":   "11pt",
	})
	scripteditor.GetSession().SetMode("ace/mode/golang")
	scripteditor.GetSession().SetUseWorker(false)
	scripteditor.GetSession().SetUseWrapMode(true)
	scripteditor.GetSession().SetUseSoftTabs(true)
	scripteditor.Get("commands").Call("addCommand", map[string]interface{}{
		"name": "save",
		"bindKey": map[string]interface{}{
			"win": "Ctrl-S",
			"mac": "Command-S",
		},
		"exec":     SaveScript,
		"readOnly": false,
	})
	jq("#script-list").Empty()
	for name := range scripts {
		templates.Append("settings-list-entry", "#script-list", map[string]interface{}{
			"ID":      fmt.Sprintf("chscript-%s", name),
			"Class":   "script-list-button",
			"Name":    name,
			"Network": net,
			"OnClick": fmt.Sprintf("ui.settings.scripts.switch('%s', '%s')", net, name),
		})
	}

	jq("#script-tool-new").Call("unbind", "click")
	jq("#script-tool-new").Call("click", func() {
		NewScript(net)
	})
}

// CloseScriptEditor closes the script editor
func CloseScriptEditor() {
	jq("#settings-main").RemoveClass("hidden")
	jq("#settings-scripts").AddClass("hidden")
	jq("#script-tool-new").Call("unbind", "click")
}

// SwitchScript switches the open script
func SwitchScript(net, name string) {
	var script string
	if net == Global {
		script = data.GlobalScripts.Get(name)
	} else {
		script = data.MustGetNetwork(net).Scripts.Get(name)
	}

	jq("#script-list > .selected-script").RemoveClass("selected-script")
	jq(fmt.Sprintf("#chscript-%s", name)).AddClass("selected-script")

	scripteditor.SetValue(script)
	jq("#script-name").SetVal(name)
}

// SaveScript saves the open script
func SaveScript() {
	selected := jq("#script-list > .selected-script")
	name := selected.Attr("data-name")
	net := selected.Attr("data-network")
	if net == Global {
		data.GlobalScripts.Put(net, name, scripteditor.GetValue(), nil)
	} else {
		data.MustGetNetwork(net).Scripts.Put(net, name, scripteditor.GetValue(), nil)
	}
}

// DeleteScript deletes a script
func DeleteScript() {
	selected := jq("#script-list > .selected-script")
	name := selected.Attr("data-name")
	net := selected.Attr("data-network")
	if net == Global {
		data.GlobalScripts.Delete(net, name, OpenScriptEditor)
	} else {
		data.MustGetNetwork(net).Scripts.Delete(net, name, OpenScriptEditor)
	}
}

// RenameScript renames a script
func RenameScript() {
	selected := jq("#script-list > .selected-script")
	name := selected.Attr("data-name")
	net := selected.Attr("data-network")
	if net == Global {
		data.GlobalScripts.Rename(net, name, jq("#script-name").Val(), OpenScriptEditor)
	} else {
		data.MustGetNetwork(net).Scripts.Rename(net, name, jq("#script-name").Val(), OpenScriptEditor)
	}
}

// NewScript creates a new script
func NewScript(net string) {
	name := "new-script"
	templates.Append("settings-list-entry", "#script-list", map[string]interface{}{
		"ID":      fmt.Sprintf("chscript-%s", name),
		"Class":   "script-list-button",
		"Name":    name,
		"Network": net,
		"OnClick": fmt.Sprintf("ui.settings.scripts.switch('%s', '%s')", net, name),
	})

	if net == Global {
		data.GlobalScripts.Put(net, name, "", nil)
	} else {
		data.MustGetNetwork(net).Scripts.Put(net, name, "", nil)
	}

	SwitchScript(net, name)
}
