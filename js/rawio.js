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
const $ = require("jquery")

/**
 * Raw messaging handler.
 */
class RawMessaging {
	/**
	 * Create a raw messaging handler.
	 *
	 * @param {mauIRC} mauirc The mauIRC object to use.
	 */
	constructor(mauirc) {
		this.mauirc = mauirc
		this.data = {}
		mauirc.events.submit("rawio", () => {
			this.send($("#rawio").attr("data-network"), $("#rawio-input").val())
			$("#rawio-input").val("")
		})
	}

	/**
	 * Open the raw IO view for the given network.
	 *
	 * @param {string} network The name of the network.
	 */
	open(network) {
		if (!this.data.hasOwnProperty(network)) {
			this.data[network] = []
		}

		this.mauirc.applyTemplate("rawio", {
			network,
			data: this.data[network],
		})
	}

	/**
	 * Push a message to the cache and to the UI (if open).
	 *
	 * @param {string} network The network to push the message to.
	 * @param {string} message The message to push.
	 */
	push(network, message) {
		this.data[network].push(message)

		const rawio = $("#rawio")
		if (rawio.length !== 0) {
			rawio.find(".output").append(`${message}<br>`)
		}
	}

	/**
	 * Handle a received raw message.
	 *
	 * @param {Object} payload The data received from the server.
	 */
	receive(payload) {
		if (!this.data.hasOwnProperty(payload.network)) {
			this.data[payload.network] = []
		}

		this.push(payload.network, `<-- ${payload.message}`)
	}

	/**
	 * Send a raw message to the given network.
	 *
	 * @param {string} network The network to send the message to.
	 * @param {string} message The message to send.
	 */
	send(network, message) {
		this.push(network, `--> ${message}`)
		this.mauirc.conn.send("raw", { network, message })
	}
}

module.exports = RawMessaging
