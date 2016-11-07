// mauIRC - The original mauIRC web frontend
// Copyright (C) 2016 Tulir Asokan
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

class Connection {
	constructor(mauirc) {
		this.mauirc = mauirc
		this.connected = false
		this.socket = undefined
	}

	get socketAddr() {
		if (window.location.protocol.startsWith("https")) {
			return "wss://" + window.location.host + "/socket"
		} else {
			return "ws://" + window.location.host + "/socket"
		}
	}

	ect() { this.connect() }
	get ected() {
		return this.connected
	}

	onMessage(data) {
		// TODO handle messages
		console.log(data)
	}

	connect() {
		this.mauirc.applyTemplate("connecting")
		this.socket = new WebSocket(this.socketAddr)
		this.socket.onmessage = event => this.onMessage(JSON.parse(event.data))
	}
}
