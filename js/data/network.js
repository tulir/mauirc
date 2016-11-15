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
const ChannelStore = require("./channel")

module.exports = class NetworkStore {
	constructor(datastore, name) {
		this.mauirc = datastore.mauirc
		this.datastore = datastore
		this.name = name
		this.ip = ""
		this.port = -1
		this.ssl = false
		this.connected = false
		this.nick = ""
		this.realname = ""
		this.user = ""
		this.channels = {}
		this.chanlist = []
	}

	get contextmenu() {
		return {
			load: {
				name: "Load history",
				exec: () => {
					for (const chan in this.channels) {
						if (this.channels.hasOwnProperty(chan)) {
							this.channels[chan].fetchHistory(512, false)
						}
					}
				},
			},
			reload: {
				name: "Reload History",
				exec: () => {
					for (const chan in this.channels) {
						if (this.channels.hasOwnProperty(chan)) {
							this.channels[chan].fetchHistory(512, true)
						}
					}
				},
			},
			// TODO remaining contextmenu entries
		}
	}

	getChanlistEntry() {
		const chanlist = this.datastore.getChanlist()
		if (chanlist === undefined) {
			return undefined
		}

		let network = chanlist.find(`.network[data-name='${this.name}']`)
		if (network.length === 0) {
			this.mauirc.appendTemplate("chanlist-network", this, chanlist)
			network = chanlist.find(`.network[data-name='${this.name}']`)
		}
		return network
	}

	getChannel(name) {
		if (name === undefined || name.length === 0) {
			return undefined
		}

		if (!this.channels.hasOwnProperty(name)) {
			this.putChannel(new ChannelStore(this, name))
		}
		return this.channels[name]
	}

	tryGetChannel(name) {
		if (this.channels.hasOwnProperty(name)) {
			return this.channels[name]
		}
		return undefined
	}

	deleteChannel(name) {
		if (this.channels.hasOwnProperty(name)) {
			delete this.channels[name]
		}
		this.datastore.updateChanlist()
	}

	putChannel(channel) {
		this.channels[channel.name] = channel
		this.datastore.updateChanlist()
	}
}
