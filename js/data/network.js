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
const Awesomplete = require("awesomplete")
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
		this.channels = new Map()
		this.chanlist = []
	}

	/**
	 * Register network-related events.
	 *
	 * @param {mauIRC} mauirc The current mauIRC instance.
	 */
	static registerEvents(mauirc) {
		mauirc.events.contextmenu("chanlist.network", (net, event) =>
			mauirc.contextmenu.open(mauirc.data.getNetwork(
					$(net).parent().attr("data-name")
				).contextmenu, event)
		)

		mauirc.events.click("channel-adder", obj => {
			const title = $(obj).find(".title")
			if (title.hasClass("hidden")) {
				return
			}
			title.addClass("hidden")

			const actualAdder = $(obj).find(".actual-adder")
			actualAdder.removeClass("hidden")

			const net = mauirc.data.getNetwork(
					$(obj).parent().parent().attr("data-name"))
			global.currentAutocompleter =
					new Awesomplete(actualAdder[0], { list: net.chanlist })
			actualAdder.focus()
		})
		mauirc.events.blur("channel-adder", obj => {
			obj = $(obj)
			let parent = obj.parent()
			if (parent.hasClass("awesomplete")) {
				obj = obj.appendTo(parent.parent())
				parent.remove()
				parent = obj.parent()
			}
			obj.addClass("hidden")
			obj.parent().find(".title").removeClass("hidden")
			obj.val("")
		})
		mauirc.events.keydown("channel-adder", (obj, evt) => {
			if (evt.keyCode !== 13 && evt.keyCode !== 27) { // Enter or escape
				return
			}
			obj = $(obj)
			let parent = obj.parent()
			if (parent.hasClass("awesomplete")) {
				obj = obj.appendTo(parent.parent())
				parent.remove()
				parent = obj.parent()
			}
			obj.addClass("hidden")
			obj.parent().find(".title").removeClass("hidden")

			if (evt.keyCode === 13) {
				const net = mauirc.data.getNetwork(parent.attr("data-network"))
				net.join(obj.val())
			}
			obj.val("")
		})
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
					for (const chan of this.channels.values()) {
						chan.fetchHistory(512, false)
					}
				},
			},
			reload: {
				name: "Reload all history",
				exec: () => {
					for (const chan of this.channels.values()) {
						chan.fetchHistory(512, true)
					}
				},
			},
			rawio: {
				name: "Raw IO",
				exec: () => window.location.href = `#/raw/${this.name}`,
			},
			disconnect: {
				name: "Disconnect",
				exec: () => void (0),
			},
			// TODO reconnect?
		}
	}

	/**
	 * Join a channel.
	 *
	 * @param {string} channel The name of the channel to join.
	 */
	join(channel) {
		if (channel.charAt(0) === "#") {
			this.mauirc.conn.send("message", {
				message: channel,
				command: "join",
				network: this.name,
				channel,
			})
		} else {
			this.getChannel(channel)
		}
		window.location.href = `#/chat/${this.name}/${channel}`
	}

	/**
	 * Run a WHOIS query.
	 *
	 * @param {string} user The user to run the query on.
	 */
	whois(user) {
		this.mauirc.conn.send("message", {
			message: user,
			command: "whois",
			network: this.name,
			channel: user,
		})
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
			this.mauirc.templates.append("chanlist/network", this, chanlist)
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

		if (!this.channels.has(name)) {
			this.putChannel(new ChannelStore(this, name))
		}
		return this.channels.get(name)
	}

	/**
	 * Get a channel within this network.
	 *
	 * @param {string} name The name of the channel to get.
	 * @returns {ChannelStore} The ChannelStore object for the channel, or
	 *                         undefined if the channel doesn't exist.
	 */
	tryGetChannel(name) {
		if (this.channels.has(name)) {
			return this.channels.get(name)
		}
		return undefined
	}

	/**
	 * Delete a channel from this network.
	 *
	 * @param {string} name The name of the channel to delete.
	 */
	deleteChannel(name) {
		if (this.channels.has(name)) {
			this.channels.delete(name)
		}
		this.datastore.updateChanlist()
	}

	/**
	 * Add a channel into this network.
	 *
	 * @param {ChannelStore} channel The ChannelStore object to add.
	 */
	putChannel(channel) {
		this.channels.set(channel.name, channel)
		this.sortChannels()
		this.datastore.updateChanlist()
	}

	/**
	 * Alphabetically sort the channels in this network.
	 */
	sortChannels() {
		this.channels = new Map([...this.channels.entries()].sort())
	}
}

module.exports = NetworkStore
