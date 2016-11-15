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
const Message = require("../message")

module.exports = class ChannelStore {
	constructor(network, name) {
		this.mauirc = network.mauirc
		this.datastore = network.datastore
		this.name = name
		this.network = network
		this.userlist = {}
		this.topic = ""
		this.topicsetat = 0
		this.topicsetby = ""
		this.modes = undefined

		this.historyFetched = false
		this.hasNewMessages = false
		this.messages = {}
	}

	updateOwnUser() {
		for (const nick in this.users) {
			if (nick === this.network.nick) {
				this.users[nick].own = "self"
				return
			}
		}
	}

	set users(val) {
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

	get users() {
		return this.userlist
	}

	get contextmenu() {
		return {
			clear: {
				name: "Clear History",
				exec: () =>
					this.datastore.func.clear(this.name, this.network.name),
			},
			reload: {
				name: "Reload History",
				exec: () => this.fetchHistory(512, true),
			},
			part: {
				name: "Part Channel",
				exec: () =>
					this.datastore.func.part(this.name, this.network.name),
			},
		}
	}

	getChanlistEntry() {
		const network = this.network.getChanlistEntry()
		if (network === undefined) {
			return undefined
		}

		let channel = network.find(
			`.channels > .channel[data-name='${this.name}']`
		)
		if (channel.length === 0) {
			this.mauirc.appendTemplate("chanlist-channel", {
				name: this.name,
				network: this.network.name,
			}, this.datastore.networks)
			channel = network.find(
				`.channels > .channel[data-name='${this.name}']`
			)
		}
		return channel
	}

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

	destroy() {
		if (this.getChatArea() !== undefined) {
			this.datastore.closeChatArea()
		}

		this.networks.delete(this.name)
	}

	clearHistory() {
		void ("TODO", this)
	}

	fetchHistory(num, reload) {
		if (reload) {
			this.historyFetched = false
			this.messages = {}
		}

		if (this.historyFetched) {
			return false
		}

		console.log(`Fetching history for ${this.name}@${this.network.name}`)

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
					this, msgData, this.previousMessageID(), false
				)
				this.messages[message.id] = message
				if (chat !== undefined) {
					this.mauirc.appendTemplate("message", message, chat)
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

	onOpen() {
		const chat = this.datastore.getChatArea()
		this.datastore.deselectChanlistEntries()
		this.network.getChanlistEntry().addClass("active")
		this.getChanlistEntry().addClass("active")

		this.hasNewMessages = false

		this.datastore.current.network = this.network.name
		this.datastore.current.channel = this.name
		chat.empty()

		if (!this.fetchHistory(512)) {
			for (const id in this.messages) {
				if (!this.messages.hasOwnProperty(id)) {
					continue
				}
				this.mauirc.appendTemplate("message", this.messages[id], chat)
			}
		}
		this.updateUserlist()
		this.datastore.scrollDown()
	}

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

		this.mauirc.applyTemplate("userlist", {
			users: this.users,
			inline: true,
		}, userlist)
	}

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

	receiveMessage(data) {
		const message = new Message(this, data, this.previousMessageID(), true)
		this.messages[message.id] = message
		const chat = this.network.datastore.getChatArea()
		if (chat !== undefined) {
			if (this.datastore.current.network === this.network.name &&
				this.datastore.current.channel === this.name) {
				this.mauirc.appendTemplate("message", message, chat)
			} else {
				this.hasNewMessages = true
				this.getChanlistEntry().addClass("notification")
			}
		} else {
			this.hasNewMessages = true
			message.notify()
		}
	}
}
