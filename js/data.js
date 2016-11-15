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

module.exports = class DataStore {
	constructor(mauirc) {
		this.mauirc = mauirc
		this.networks = {}

		this.current = {
			networkCached: "",
			channelCached: "",
			set network(val) {
				this.networkCached = val
				const chat = mauirc.data.getChatArea()
				if (chat !== undefined) {
					chat.attr("data-network", val)
				}
			},
			get network() {
				return this.networkCached
			},
			set channel(val) {
				this.channelCached = val
				const chat = mauirc.data.getChatArea()
				if (chat !== undefined) {
					chat.attr("data-channel", val)
				}
			},
			get channel() {
				return this.channelCached
			},
		}

		mauirc.events.click("vswitch.chat", () => this.openChat())
		mauirc.events.click("vswitch.channels", () => this.openChanlist())
		mauirc.events.click("vswitch.users", () => this.openUserlist())

		mauirc.events.click("chanlist-channel", chan => {
			this.getChannel(
				chan.getAttribute("data-network"),
				chan.getAttribute("data-name")
			).open(true)
		})

		mauirc.events.submit("chat", () => {
			// const chat = this.getChatArea()
			this.mauirc.conn.send("message", {
				message: $("#chat-input").val(),
				command: "privmsg",
				channel: this.current.channel,
				network: this.current.network,
			})
			$("#chat-input").val("")
		})
	}

	receive(message) {
		const chan = this.getChannel(message.network, message.channel)
		chan.open()
		chan.receiveMessage(message)
		this.scrollDown()
	}

	openChat() {
		let chan = this.getChannel(this.current.network, this.current.channel)
		if (chan === undefined) {
			chan = { users: [], messages: [] }
		}
		this.mauirc.applyTemplate("chat", {
			networks: this.mauirc.data.networks,
			users: chan.users,
			messages: chan.messages,
			network: this.current.network,
			channel: this.current.channel,
		})
		this.scrollDown()
	}

	scrollDown() {
		const chat = this.getChatArea()
		if (chat !== undefined) {
			chat.scrollTop(chat.prop("scrollHeight"))
		}
	}

	openUserlist() {
		this.mauirc.applyTemplate("userlist", {
			users: this.getChannel(this.current.network, this.current.channel),
		})
	}

	updateChanlist() {
		const chat = this.getChatArea()
		if (chat === undefined) {
			return
		}

		const chanlist = chat.parent().find(".chanlist-container")
		if (chanlist.length === 0) {
			return
		}

		this.mauirc.applyTemplate("chanlist", {
			inline: true,
			networks: this.networks,
		}, chanlist)
	}

	openChanlist() {
		this.mauirc.applyTemplate("chanlist", this)
	}

	getNetwork(name) {
		if (name === undefined || name.length === 0) {
			return undefined
		}

		if (!this.networks.hasOwnProperty(name)) {
			this.putNetwork(new NetworkStore(this, name))
		}
		return this.networks[name]
	}

	putNetwork(network) {
		this.networks[network.name] = network
	}

	getChannel(net, name) {
		if (net === undefined || net.length === 0 ||
			name === undefined || name.length === 0) {
			return undefined
		}

		return this.getNetwork(net).getChannel(name)
	}

	putChannel(net, name) {
		this.getNetwork(net).putChannel(name)
	}

	getChanlist() {
		const chanlist = this.mauirc.container.find("#networks")
		if (chanlist.length === 0) {
			return undefined
		}
		return chanlist
	}

	getChatArea() {
		const chat = this.mauirc.container.find(".chat-container > .chat")
		if (chat.length === 0) {
			return undefined
		}
		return chat
	}

	deselectChanlistEntries() {
		const chanlist = this.getChanlist()
		chanlist.find(".network.active").removeClass("active")
		chanlist.find(".network .channel.active").removeClass("active")
	}

	process(type, data) {
		let net
		let chan
		switch (type) {
		case "chandata":
			chan = this.getChannel(data.network, data.name)
			chan.topic = data.topic
			chan.topicsetat = data.topicsetat
			chan.topicsetby = data.topicsetby
			chan.users = data.userlist
			chan.modes = data.modes
			chan.updateUserlist()
			this.updateChanlist()
			break
		case "chanlist":
			this.getNetwork(data.network).chanlist = data.list
			break
		case "netdata":
			net = this.getNetwork(data.name)
			net.connected = data.connected
			net.ip = data.ip
			net.nick = data.nick
			net.port = data.port
			net.realname = data.realname
			net.ssl = data.ssl
			net.user = data.user
			for (chan in net.channels) {
				if (!net.channels.hasOwnProperty(chan)) {
					continue
				}
				net.channels[chan].updateOwnUser()
			}
			break
		}
	}
}

class NetworkStore {
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

	putChannel(channel) {
		this.channels[channel.name] = channel
	}
}

class ChannelStore {
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
		const chat = this.network.datastore.getChatArea()
		if (chat === undefined) {
			return undefined
		}

		if (this.datastore.current.network === this.network.name &&
			this.datastore.current.channel === this.name) {
			return chat
		}
		return undefined
	}

	fetchHistory(num, force) {
		if (this.historyFetched && !force) {
			return false
		}

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

	open(force) {
		const chat = this.datastore.getChatArea()
		if (chat === undefined) {
			if (force) {
				this.datastore.current.network = this.network.name
				this.datastore.current.channel = this.name
				this.fetchHistory(512)
				this.datastore.openChat()
			}
			return
		}

		this.network.datastore.deselectChanlistEntries()
		this.network.getChanlistEntry().addClass("active")
		this.getChanlistEntry().addClass("active")

		this.hasNewMessages = false

		if (this.datastore.current.network === this.network.name &&
			this.datastore.current.channel === this.name) {
			return
		}

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
