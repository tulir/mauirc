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
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Connection handler.
 */
class Connection {
	/**
	 * Create a connection handler.
	 *
	 * @param {mauIRC} mauirc The mauIRC object to use.
	 */
	constructor(mauirc) {
		this.mauirc = mauirc
		this.connected = false
		this.socket = undefined
	}

	/**
	 * Get the address to the WebSocket.
	 *
	 * @returns {string} The address.
	 */
	static get socketAddr() {
		if (window.location.protocol.startsWith("https")) {
			return `wss://${window.location.host}/socket`
		}
		return `ws://${window.location.host}/socket`
	}

	/**
	 * Shorthand for {@link Connection#connect}.
	 */
	ect() { this.connect() }

	/**
	 * Shorthand for {@link Connection#connected}.
	 *
	 * @returns {bool} Whether or not a connection has been established.
	 */
	get ected() { return this.connected }

	/**
	 * Shorthand for {@link Connection#socket}.
	 *
	 * @returns {WebSocket} The WebSocket object.
	 */
	get ection() { return this.socket }

	/**
	 * Send a message through the socket.
	 *
	 * @param {string} type     The type of the message.
	 * @param {string} [object] The data of the message.
	 */
	send(type, object) {
		if (object === null || object === undefined) {
			return
		}

		this.socket.send(JSON.stringify({ type, object }))
	}

	/**
	 * Given as the {@linkcode onopen} callback for the WebSocket.
	 */
	onConnect() {
		this.connected = true
		window.location.hash = this.mauirc.nextPage || "#/chat"
	}

	/**
	 * Given as the {@linkcode onclose} callback for the WebSocket.
	 */
	onDisconnect() {
		this.connected = false
		this.mauirc.nextPage = "#/chat"
		window.location.hash = "#/connect"
	}

	/**
	 * Given as the {@linkcode onmessage} callback for the WebSocket.
	 *
	 * @param {Object} data The data that came from the server.
	 */
	onMessage(data) {
		switch (data.type) {
		case "message":
			this.mauirc.data.receive(data.object)
			break
		case "raw":
			this.mauirc.raw.receive(data.object)
			break
		case "chandata":
		case "chanlist":
		case "netdata":
			this.mauirc.data.process(data.type, data.object)
			break
		case "delete":
			this.mauirc.data.getMessage(data.object).destroy()
			break
		case "clear":
			this.mauirc.data
					.getChannel(data.object.network, data.object.channel)
					.destroyHistory()
			break
		default:
			console.log(data)
		}
	}

	/**
	 * Try to connect to the server.
	 */
	connect() {
		this.mauirc.templates.apply("connecting")
		this.socket = new WebSocket(Connection.socketAddr)
		this.socket.onmessage = event => this.onMessage(JSON.parse(event.data))
		this.socket.onopen = () => this.onConnect()
		this.socket.onclose = () => this.onDisconnect()
	}
}

module.exports = Connection
