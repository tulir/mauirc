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
const NetworkStore = require("./network")
const MiscFunctions = require("./misc")

module.exports = class DataStore {
	constructor(mauirc) {
		this.mauirc = mauirc
		this.func = new MiscFunctions(mauirc)
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

		mauirc.events.contextmenu("chanlist-channel", (chan, event) => {
			this.mauirc.contextmenu.open(this.getChannel(
				chan.getAttribute("data-network"),
				chan.getAttribute("data-name")
			).contextmenu, event)
		})

		mauirc.events.submit("chat", () => {
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

	openChat(net, chan) {
		let chanObj = { users: [], messages: [], onOpen: () => void (0) }
		if (net !== undefined && chan !== undefined &&
			net.length !== 0 && chan.length !== 0) {
			chanObj = this.tryGetChannel(net, chan)
			if (chanObj === undefined) {
				chanObj = { users: [], messages: [], onOpen: () => void (0) }
			}
		}
		this.mauirc.applyTemplate("chat", {
			networks: this.mauirc.data.networks,
			users: chanObj.users,
			messages: chanObj.messages,
			network: net,
			channel: chan,
		})
		this.current.network = net
		this.current.channel = chan
		chanObj.onOpen()
		this.scrollDown()
	}

	scrollDown() {
		const chat = this.getChatArea()
		if (chat !== undefined) {
			chat.scrollTop(chat.prop("scrollHeight"))
		}
	}

	openUserlist(net, chan) {
		this.mauirc.applyTemplate("userlist", {
			users: this.tryGetChannel(net, chan).users,
			network: this.current.network,
			channel: this.current.channel,
		})
	}

	updateChanlist() {
		const chat = this.getChatArea()

		let chanlist
		let inline
		if (chat === undefined) {
			chanlist = this.mauirc.container.find(".channel-list")
			inline = false
		} else {
			chanlist = chat.parent().find(".chanlist-container")
			inline = true
		}
		if (chanlist.length === 0) {
			return
		}

		this.mauirc.applyTemplate("chanlist", {
			inline,
			networks: this.networks,
			network: this.current.network,
			channel: this.current.channel,
		}, chanlist)
	}

	openChanlist() {
		this.mauirc.applyTemplate("chanlist", {
			networks: this.networks,
			network: this.current.network,
			channel: this.current.channel,
		})
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

	tryGetNetwork(name) {
		if (this.networks.hasOwnProperty(name)) {
			return this.networks[name]
		}
		return undefined
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

	tryGetChannel(net, name) {
		if (this.networks.hasOwnProperty(net)) {
			return this.networks[net].tryGetChannel(name)
		}
		return undefined
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

	closeChatArea() {
		this.current.network = ""
		this.current.channel = ""
		const chat = this.getChatArea()
		if (chat !== undefined) {
			chat.empty()
		}
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
