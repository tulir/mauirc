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

class DataStore {
	constructor(mauirc) {
		this.mauirc = mauirc
		this.networks = {}


		mauirc.registerEventHandler("chanlist-channel:click", chan => {
			this.getChannel(
				chan.getAttribute("data-network"),
				chan.getAttribute("data-name")
			).open(chan)
		})
	}

	getNetwork(name) {
		if (!this.networks.hasOwnProperty(name)) {
			this.putNetwork(new NetworkStore(this, name))
		}
		return this.networks[name]
	}

	putNetwork(network) {
		this.networks[network.name] = network
	}

	getChannel(net, name) {
		return this.getNetwork(net).getChannel(name)
	}

	putChannel(net, name) {
		this.getNetwork(net).putChannel(name)
	}

	getChanlist() {
		let chanlist = this.mauirc.container.find("#networks")
		if (chanlist.length === 0) {
			return undefined
		}
		return chanlist
	}

	getChatArea() {
		let chat = this.mauirc.container.find(".chat-container > .chat")
		if (chat.length === 0) {
			return undefined
		}
		return chat
	}

	deselectChanlistEntries() {
		let chanlist = this.getChanlist()
		chanlist.find(".network.active").removeClass("active")
		chanlist.find(".network .channel.active").removeClass("active")
	}

	process(type, data) {
		let net
		switch(type) {
		case "chandata":
			let chan = new ChannelStore(this.getNetwork(data.network), data.name)
			chan.topic = data.topic
			chan.topicsetat = data.topicsetat
			chan.topicsetby = data.topicsetby
			chan.users = data.userlist
			chan.modes = data.modes
			this.putChannel(data.network, chan)
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
		let chanlist = this.datastore.getChanlist()
		if (chanlist === undefined) {
			return undefined
		}

		let network = chanlist.find(".network[data-name='" + this.name + "']")
		if (network.length === 0) {
			this.mauirc.appendTemplate("chanlist-network", this, chanlist)
			network = chanlist.find(".network[data-name='" + this.name + "']")
		}
		return network
	}

	getChannel(name) {
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
		this.name = name
		this.network = network
		this.users = []
		this.topic = ""
		this.topicsetat = 0
		this.topicsetby = ""
		this.modes = undefined

		this.hasNewMessages = false
		this.messages = {}
	}

	getChanlistEntry() {
		let network = this.network.getChanlistEntry()
		if (network === undefined) {
			return undefined
		}

		let channel = network.find(
			".channels > .channel[data-name='" + this.name + "']"
		)
		if (channel.length === 0) {
			this.mauirc.appendTemplate("chanlist-channel", {
				name: this.name,
				network: this.network.name
			}, networks)
			let channel = network.find(
				".channels > .channel[data-name='" + this.name + "']"
			)
		}
		return channel
	}

	getChatArea() {
		let chat = this.network.datastore.getChatArea()
		if (chat === undefined) {
			return undefined
		}

		if (chat.attr("data-network") === this.network.name &&
			chat.attr("data-channel") === this.name) {
			return chat
		}
		return undefined
	}

	open() {
		let chat = this.network.datastore.getChatArea()
		if (chat === undefined) {
			return
		}

		this.network.datastore.deselectChanlistEntries()
		this.network.getChanlistEntry().addClass("active")
		this.getChanlistEntry().addClass("active")

		this.hasNewMessages = false

		if (chat.attr("data-network") === this.network.name &&
			chat.attr("data-channel") === this.name) {
			return
		}

		chat.attr("data-network", this.network.name)
		chat.attr("data-channel", this.name)
		chat.empty()

		for (let id in this.messages) {
			this.mauirc.appendTemplate("message", this.messages[id], chat)
		}
	}

	previousMessageID() {
		let prevID = -1
		for (let id in this.messages) {
			id = +id
			if (prevID < id) {
				prevID = id
			}
		}
		return prevID
	}

	receiveMessage(data) {
		let message = new Message(this, data, this.previousMessageID())
		this.messages[message.id] = message
		let chat = this.network.datastore.getChatArea()
		if (chat !== undefined) {
			if (chat.attr("data-network") === data.network
				&& chat.attr("data-channel") === data.channel) {
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
