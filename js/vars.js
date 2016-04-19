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

var socket = null
var timeout = null
var connected = false
var authfail = false
var msgcontainer = false
var titleEditClick = 0
var data = new DataStore()
var scripteditor = null
var joinedMessages = []

var websocketPath = 'wss://' + window.location.host + '/socket'
if (window.location.protocol !== "https:") {
  websocketPath = 'ws://' + window.location.host + '/socket'
}
