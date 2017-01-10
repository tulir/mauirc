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

/**
 * Network data storage.
 */
class NetworkStore {
	/**
	 * Create an instance of NetworkStore.
	 *
	 * @param {DataStore} datastore The DataStore object to use.
	 * @param {string} name The name of the network.
	 */
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

	/**
	 * Get the context menu object for this network.
	 *
	 * @returns {ContextMenuData} The contextmenu data.
	 */
	get contextmenu() {
		return {
			load: {
				name: "Load all history",
				exec: () => {
					for (const chan in this.channels) {
						if (this.channels.hasOwnProperty(chan)) {
							this.channels[chan].fetchHistory(512, false)
						}
					}
				},
			},
			reload: {
				name: "Reload all History",
				exec: () => {
					for (const chan in this.channels) {
						if (this.channels.hasOwnProperty(chan)) {
							this.channels[chan].fetchHistory(512, true)
						}
					}
				},
			},
			rawio: {
				name: "Raw IO",
				exec: () => window.location.href = `#/raw/${this.name}`,
			},
			// TODO remaining contextmenu entries
		}
	}

	/**
	 * Get the jQuery object for the network entry in the channel list UI.
	 *
	 * @returns {JQuery} The object.
	 */
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

	/**
	 * Get a channel within this network and create it if it doesn't exist yet.
	 *
	 * @param {string} name The name of the channel to get.
	 * @returns {ChannelStore} The ChannelStore object for the channel, or
	 *                         undefined if no channel name specified.
	 */
	getChannel(name) {
		if (name === undefined || name.length === 0) {
			return undefined
		}

		if (!this.channels.hasOwnProperty(name)) {
			this.putChannel(new ChannelStore(this, name))
		}
		return this.channels[name]
	}

	/**
	 * Get a channel within this network.
	 *
	 * @param {string} name The name of the channel to get.
	 * @returns {ChannelStore} The ChannelStore object for the channel, or
	 *                         undefined if the channel doesn't exist.
	 */
	tryGetChannel(name) {
		if (this.channels.hasOwnProperty(name)) {
			return this.channels[name]
		}
		return undefined
	}

	/**
	 * Delete a channel from this network.
	 *
	 * @param {string} name The name of the channel to delete.
	 */
	deleteChannel(name) {
		if (this.channels.hasOwnProperty(name)) {
			delete this.channels[name]
		}
		this.datastore.updateChanlist()
	}

	/**
	 * Add a channel into this network.
	 *
	 * @param {ChannelStore} channel The ChannelStore object to add.
	 */
	putChannel(channel) {
		this.channels[channel.name] = channel
		this.datastore.updateChanlist()
	}
}

module.exports = NetworkStore
