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

module.exports = class MiscFunctions {
	constructor(mauirc) {
		this.mauirc = mauirc
	}

	delete(id) {
		this.mauirc.conn.send("delete", id)
	}

	clear(network, channel) {
		this.mauirc.conn.send("clear", { network, channel })
	}

	part(network, channel) {
		if (channel.charAt(0) === "#") {
			this.mauirc.conn.send("message", {
				message: "Leaving", command: "part", network, channel,
			})
		} else {
			this.mauirc.conn.send("close", { network, channel })
		}
		// TODO UI close channel
	}
}