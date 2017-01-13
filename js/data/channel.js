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
const Message = require("./message")

/**
 * Channel data storage.
 *
 * @property {string} name The name of the channel
 * @property {string} topic The topic of the channel
 * @property {number} topicsetat The Unix timestamp when the topic was set
 * @property {string} topicsetby The user who set the topic
 * @property {string} messages All fetched messages in this channel
 */
class ChannelStore {
	/**
	 * Create an instance of ChannelStore.
	 *
	 * @param {DataStore} network The NetworkStore object to use.
	 * @param {string} name The name of the channel.
	 */
	constructor(network, name) {
		this.mauirc = network.mauirc
		this.datastore = network.datastore
		this.network = network
		this.name = name

		this.userlist = {}

		this.topic = ""
		this.topicsetat = 0
		this.topicsetby = ""

		this.modes = undefined

		this.historyFetched = false
		this.newMessages = 0
		this.messages = {}
	}

	/**
	 * Register channel-related events.
	 *
	 * @param {mauIRC} mauirc The current mauIRC instance.
	 */
	static registerEvents(mauirc) {
		mauirc.events.contextmenu("chanlist.channel", (chan, event) =>
			mauirc.contextmenu.open(mauirc.data.getChannel(
					chan.getAttribute("data-network"),
					chan.getAttribute("data-name")
				).contextmenu, event)
		)

		mauirc.events.doubleclick("topic", obj => $(obj).addClass("editing"))
		mauirc.events.blur("topic-edit", obj => {
			obj = $(obj)
			obj.val(obj.parent().text().trim())
			obj.parent().removeClass("editing")
		})
		mauirc.events.keydown("topic-edit", (obj, evt) => {
			if (evt.keyCode === 13) { // Enter
				obj = $(obj)
				mauirc.data.getChannel(
						mauirc.data.current.network,
						mauirc.data.current.channel
					).setTitle(obj.val())
				obj.val(obj.parent().text().trim())
				obj.parent().removeClass("editing")
			} else if (evt.keyCode === 27) { // Escape
				obj = $(obj)
				obj.val(obj.parent().text().trim())
				obj.parent().removeClass("editing")
			}
		})
	}

	/**
	 * Add the {@linkplain self} class to the correct entry in the channel
	 * userlist.
	 */
	updateOwnUser() {
		for (const nick in this.users) {
			if (nick === this.network.nick) {
				this.users[nick].own = "self"
				return
			}
		}
	}

	/**
	 * Update the userlist.
	 *
	 * @param  {string[]} val The new userlist.
	 */
	set users(val) {
		if (val === null) {
			return
		}
		for (const elem of val) {
			let plain = elem
			if (/^[~&@%+]/.exec(elem)) {
				plain = elem.substr(1)
			}
			this.userlist[plain] = {
				name: plain,
				listName: elem,
				own: this.network.nick === plain ? "self" : "",
			}
		}
	}

	/**
	 * Get the userlist.
	 *
	 * @returns {Object[]} The userlist.
	 */
	get users() {
		return this.userlist
	}

	/**
	 * Get the context menu object for this network.
	 *
	 * @returns {ContextMenuData} The contextmenu data.
	 */
	get contextmenu() {
		return {
			clear: {
				name: "Clear history",
				exec: () => this.clearHistory(),
			},
			reload: {
				name: `${this.historyFetched ? "Reload" : "Load"} history`,
				exec: () => this.fetchHistory(512, true),
			},
			part: {
				name: "Part channel",
				exec: () => this.part(),
			},
		}
	}

	/**
	 * Get the jQuery object for the channel entry in the channel list UI.
	 *
	 * @returns {JQuery} The object.
	 */
	getChanlistEntry() {
		const network = this.network.getChanlistEntry()
		if (network === undefined) {
			return undefined
		}

		let channel = network.find(
				`.channels > .channel[data-name='${this.name}']`)
		if (channel.length === 0) {
			this.mauirc.templates.append("chanlist/channel", {
				name: this.name,
				network: this.network.name,
				new: this.newMessages > 0,
			}, this.datastore.networks)
			channel = network.find(
					`.channels > .channel[data-name='${this.name}']`)
		}
		return channel
	}

	/**
	 * Get the chat area if the channel is open.
	 *
	 * @returns {JQuery} The chat area, or undefined if the channel is not open.
	 */
	getChatArea() {
		const chat = this.datastore.getChatArea()
		if (chat === undefined) {
			return undefined
		}

		if (this.datastore.current.network === this.network.name &&
				this.datastore.current.channel === this.name) {
			return chat
		}
		return undefined
	}

	/**
	 * Destroy this channel.
	 */
	destroy() {
		if (this.getChatArea() !== undefined) {
			this.datastore.closeChatArea()
		}

		this.networks.delete(this.name)
	}

	/**
	 * Fetch history for this channel.
	 *
	 * @param {number} num The number of historical messages to fetch.
	 * @param {bool} reload Whether or not to re-fetch history if already
	 *                      fetched.
	 * @returns {bool} Whether or not history was fetched.
	 */
	fetchHistory(num, reload) {
		if (reload) {
			this.historyFetched = false
			this.destroyHistory()
		}

		if (this.historyFetched) {
			return false
		}

		console.log("Fetching history for", this.name, "@", this.network.name)

		$.ajax({
			type: "GET",
			url: `/history/${this.network.name}/${
					encodeURIComponent(this.name)}/?n=${num}`,
			dataType: "json",
		})
		.done(data => {
			if (data === null) {
				console.log("No data received!")
				return
			}
			const chat = this.getChatArea()
			for (const msgData of data.reverse()) {
				const message = new Message(
						this, msgData, this.previousMessageID(), false)
				this.messages[message.id] = message
				if (chat !== undefined) {
					this.mauirc.templates.append("message", message, chat)
				}
			}
			this.datastore.scrollDown()
			this.historyFetched = true
		})
		.fail(info => {
			console.error("Failed to fetch history: HTTP", info.status)
			console.error(info)

			// TODO show error?
		})
		return true
	}

	/**
	 * Called when the channel is opened by the user.
	 */
	onOpen() {
		const chat = this.datastore.getChatArea()
		this.datastore.deselectChanlistEntries()
		this.network.getChanlistEntry().addClass("active")
		this.getChanlistEntry().addClass("active")

		this.datastore.newMessageAppeared(-this.newMessages)
		this.newMessages = 0

		this.datastore.current.network = this.network.name
		this.datastore.current.channel = this.name
		chat.empty()

		if (!this.fetchHistory(512)) {
			for (const id in this.messages) {
				if (!this.messages.hasOwnProperty(id)) {
					continue
				}
				this.mauirc.templates.append("message", this.messages[id], chat)
			}
		}
		this.updateUserlist()
		this.datastore.scrollDown()
	}

	/**
	 * Update the user list UI.
	 */
	updateUserlist() {
		if (this.datastore.current.network !== this.network.name ||
			this.datastore.current.channel !== this.name) {
			return
		}

		const chat = this.datastore.getChatArea()
		if (chat === undefined) {
			return
		}

		const userlist = chat.parent().find(".userlist-container")
		if (userlist.length === 0) {
			return
		}

		this.mauirc.templates.apply("userlist", {
			users: this.users,
			inline: true,
		}, userlist)
	}

	/**
	 * Update the topic in the UI.
	 */
	updateTopic() {
		if (this.datastore.current.network !== this.network.name ||
			this.datastore.current.channel !== this.name) {
			return
		}

		const chat = this.datastore.getChatArea()
		if (chat === undefined) {
			return
		}

		const topic = chat.parent().find(".topbar-container > .topbar > .topic")
		if (topic.length === 0) {
			console.warn("Failed to update topic: Not found")
			return
		}

		topic.find(".text").text(this.topic)
		topic.find(".edit").val(this.topic)
	}

	/**
	 * Get the ID of the last message in this channel.
	 *
	 * @returns {number} The ID of the previous message, or -1 if no messages.
	 */
	previousMessageID() {
		let prevID = -1
		for (let id in this.messages) {
			if (!this.messages.hasOwnProperty(id)) {
				continue
			}
			id = +id
			if (prevID < id) {
				prevID = id
			}
		}
		return prevID
	}

	/**
	 * Handle an incoming message.
	 *
	 * @param {Object} data The server-sent data of the message.
	 */
	receiveMessage(data) {
		const message = new Message(this, data, this.previousMessageID(), true)
		this.messages[message.id] = message
		const chat = this.network.datastore.getChatArea()

		if (!document.hasFocus()) {
			message.notify()
		}

		if (chat !== undefined) {
			if (this.datastore.current.network === this.network.name &&
				this.datastore.current.channel === this.name) {
				this.mauirc.templates.append("message", message, chat)
			} else {
				this.datastore.newMessageAppeared(1)
				this.newMessages++
				this.getChanlistEntry().addClass("notification")
			}
		} else {
			this.datastore.newMessageAppeared(1)
			this.newMessages++
		}
	}

	/**
	 * Try to set the title for this channel.
	 *
	 * @param {string} newTitle The new title.
	 */
	setTitle(newTitle) {
		this.mauirc.conn.send("message", {
			message: newTitle,
			command: "topic",
			network: this.network.name,
			channel: this.name,
		})
	}

	/**
	 * Clear the history of this channel.
	 */
	clearHistory() {
		this.mauirc.conn.send("clear", {
			network: this.network.name,
			channel: this.name,
		})
	}

	/**
	 * Destroy the local history.
	 */
	destroyHistory() {
		for (const id in this.messages) {
			if (this.messages.hasOwnProperty(id)) {
				delete this.datastore.messagePointers[id]
			}
		}
		this.messages = {}
		const chat = this.getChatArea()
		if (chat !== undefined) {
			chat.empty()
		}
	}

	/**
	 * Leave this channel.
	 *
	 * @param {string} message The message to send as the part message.
	 */
	part(message) {
		if (this.name.charAt(0) === "#") {
			this.mauirc.conn.send("message", {
				message: message || "Leaving",
				command: "part",
				network: this.network.name,
				channel: this.name,
			})
		} else {
			this.mauirc.conn.send("close", {
				network: this.network.name,
				channel: this.name,
			})
		}
		if (this.datastore.current.network === this.network.name &&
				this.datastore.current.channel === this.name) {
			window.location.hash = "#/chat"
		}
		this.network.deleteChannel(this.name)
	}
}

module.exports = ChannelStore
