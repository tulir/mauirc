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

// ScriptStore contains functions common to stores that have a script unit
type ScriptStore map[string]string

// Get the script with the given name
func (ss ScriptStore) Get(name string) string {
	script, _ := ss[name]
	return script
}

// Put the given script under the given name
func (ss ScriptStore) Put(name, script string) {
	ss[name] = script
	// TODO update to server
}

// Delete the script with the given name
func (ss ScriptStore) Delete(name string) {
	delete(ss, name)
	// TODO update to server
}
