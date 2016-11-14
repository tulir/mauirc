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
"use strict"
const $ = require("jquery")

module.exports = class RawMessaging {
	constructor(mauirc) {
		this.mauirc = mauirc
		this.data = {}
		mauirc.events.submit("rawio", () => {
			this.send($("#rawio").attr("data-network"), $("#rawio-input").val())
			$("#rawio-input").val("")
		})
	}

	open(network) {
		if (!this.data.hasOwnProperty(network)) {
			this.data[network] = []
		}

		this.mauirc.applyTemplate("rawio", {
			network: network,
			data: this.data[network]
		})
	}

	push(network, message) {
		this.data[network].push(message)

		let rawio = $("#rawio")
		if (rawio.length !== 0) {
			rawio.find(".output").append(message + "<br>")
		}
	}

	receive(payload) {
		if (!this.data.hasOwnProperty(payload.network)) {
			this.data[payload.network] = []
		}

		this.push(payload.network, "<-- " + payload.message)
	}

	send(network, message) {
		this.push(network, "--> " + message)
		this.mauirc.conn.send("raw", {
			network: network,
			message: message
		})
	}
}
