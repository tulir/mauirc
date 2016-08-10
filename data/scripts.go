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

// Package data contains the session data storage system
package data

import (
	"fmt"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc/util/console"
)

// ScriptStore contains functions common to stores that have a script unit
type ScriptStore map[string]string

// Get the script with the given name
func (ss ScriptStore) Get(name string) string {
	script, _ := ss[name]
	return script
}

// Rename the script with the given name
func (ss ScriptStore) Rename(net, oldName, newName string, callback func()) {
	jquery.Ajax(map[string]interface{}{
		"type": "POST",
		"url":  fmt.Sprintf("/script/%s/%s/", net, oldName),
		"data": fmt.Sprintf("%s,%s", net, newName),
		jquery.SUCCESS: func() {
			console.Log("Successfully renamed script", oldName, "@", net, "to", newName)

			ss[newName] = ss[oldName]
			delete(ss, oldName)
			callback()
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			console.Error("Failed to rename script: HTTP", info["status"])
			console.Error(info)
		},
	})
}

// Put the given script under the given name
func (ss ScriptStore) Put(net, name, script string, callback func()) {
	jquery.Ajax(map[string]interface{}{
		"type": "PUT",
		"url":  fmt.Sprintf("/script/%s/%s/", net, name),
		"data": script,
		jquery.SUCCESS: func(data string) {
			ss[name] = script
			console.Log("Successfully updated script", name, "@", net)
			callback()
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			console.Error("Failed to update script: HTTP", info["status"])
			console.Error(info)
		},
	})
}

// Delete the script with the given name
func (ss ScriptStore) Delete(net, name string, callback func()) {
	jquery.Ajax(map[string]interface{}{
		"type": "DELETE",
		"url":  fmt.Sprintf("/script/%s/%s/", net, name),
		jquery.SUCCESS: func() {
			delete(ss, name)
			console.Log("Successfully deleted script", name, "@", net)
			callback()
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			console.Error("Failed to delete script: HTTP", info["status"])
			console.Error(info)
		},
	})
}
