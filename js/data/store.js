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
const ChannelStore = require("./channel")
const Message = require("./message")

/**
 * Data storage and processing system
 */
class DataStore {
	/**
	 * Create an instance of DataStore.
	 *
	 * @param {mauIRC} mauirc The mauIRC object to use.
	 */
	constructor(mauirc) {
		this.mauirc = mauirc
		this.networks = {}
		this.messagePointers = []
		this.newMessagesInt = 0

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

		// Register all chat-related events
		DataStore.registerEvents(mauirc)
		NetworkStore.registerEvents(mauirc)
		ChannelStore.registerEvents(mauirc)
		Message.registerEvents(mauirc)
	}

	/**
	 * Called when a new message appears on a unfocused channel.
	 *
	 * @param {number} num The number of messages that appeared.
	 *                     May be negative.
	 */
	newMessageAppeared(num) {
		this.newMessagesInt += num
		if (this.newMessagesInt > 0) {
			document.title = `${global.TITLE_BASE} (${this.newMessagesInt})`
		} else {
			document.title = global.TITLE_BASE
		}
	}

	/**
	 * Register generic chat (not network/channel/message -related) events.
	 *
	 * @param {mauIRC} mauirc The current mauIRC instance.
	 */
	static registerEvents(mauirc) {
		mauirc.events.submit("chat", () => {
			mauirc.conn.send("message", {
				message: Message.encodeIRC($("#chat-input").val()),
				command: "privmsg",
				channel: mauirc.data.current.channel,
				network: mauirc.data.current.network,
			})
			$("#chat-input").val("")
		})
	}

	/**
	 * Get the message with the given ID.
	 *
	 * @param {number} id The ID of the message to get.
	 * @returns {Message} The message object.
	 */
	getMessage(id) {
		const pointer = this.messagePointers[id]
		return this.getChannel(pointer.network, pointer.channel).messages[id]
	}

	/**
	 * Handle a server-sent message object.
	 *
	 * @param {Object} message The data sent by the server.
	 */
	receive(message) {
		const chan = this.getChannel(message.network, message.channel)
		chan.receiveMessage(message)
		this.scrollDown()
	}

	/**
	 * Open the chat view.
	 *
	 * @param {string} net The network to open.
	 * @param {string} chan The channel to open.
	 */
	openChat(net, chan) {
		let chanObj = { users: [], messages: [], onOpen: () => void (0) }
		if (net !== undefined && chan !== undefined &&
				net.length !== 0 && chan.length !== 0) {
			chanObj = this.tryGetChannel(net, chan)
			if (chanObj === undefined) {
				chanObj = { users: [], messages: [], onOpen: () => void (0) }
			}
		}
		this.mauirc.templates.apply("chat", {
			networks: this.mauirc.data.networks,
			users: chanObj.users,
			messages: chanObj.messages,
			topic: chanObj.topic,
			network: net,
			channel: chan,
		})
		this.current.network = net
		this.current.channel = chan
		chanObj.onOpen()
		this.scrollDown()
	}

	/**
	 * If open, scroll to the bottom of the chat area.
	 */
	scrollDown() {
		const chat = this.getChatArea()
		if (chat !== undefined) {
			chat.scrollTop(chat.prop("scrollHeight"))
		}
	}

	/**
	 * Open a standalone userlist.
	 *
	 * @param {string} net The network to open.
	 * @param {string} chan The channel to open.
	 */
	openUserlist(net, chan) {
		this.mauirc.templates.apply("userlist", {
			users: this.tryGetChannel(net, chan).users,
			network: this.current.network,
			channel: this.current.channel,
		})
	}

	/**
	 * If the channel list is open, update it.
	 */
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

		this.mauirc.templates.apply("chanlist/view", {
			inline,
			networks: this.networks,
			network: this.current.network,
			channel: this.current.channel,
		}, chanlist)
	}

	/**
	 * Open a standalone channel list.
	 */
	openChanlist() {
		this.mauirc.templates.apply("chanlist/view", {
			networks: this.networks,
			network: this.current.network,
			channel: this.current.channel,
		})
	}

	/**
	 * Get the data of a network.
	 *
	 * @param {string} name The name of the network.
	 * @returns {NetworkStore} The network object. If the network doesn't exist,
	 *                         it will be created and returned. If no name was
	 *                         given, this will return {@linkcode undefined}.
	 */
	getNetwork(name) {
		if (name === undefined || name.length === 0) {
			return undefined
		}

		if (!this.networks.hasOwnProperty(name)) {
			this.putNetwork(new NetworkStore(this, name))
		}
		return this.networks[name]
	}

	/**
	 * Try to get the data of a network.
	 *
	 * @param {string} name The name of the network.
	 * @returns {NetworkStore} The network object. If no network by the given
	 *                         name is found, this will return
	 *                         {@linkcode undefined}.
	 */
	tryGetNetwork(name) {
		if (this.networks.hasOwnProperty(name)) {
			return this.networks[name]
		}
		return undefined
	}

	/**
	 * Store a network object.
	 *
	 * @param {NetworkStore} network The network object.
	 */
	putNetwork(network) {
		this.networks[network.name] = network
	}

	/**
	 * Get the data of a channel.
	 *
	 * @param {string} net The name of the network.
	 * @param {string} name The name of the channel.
	 * @returns {ChannelStore} The channel object. If the channel or network
	 *                         doesn't exist, they will be created and returned.
	 *                         If no network or name was given, this will
	 *                         return {@linkcode undefined}.
	 */
	getChannel(net, name) {
		if (net === undefined || net.length === 0 ||
			name === undefined || name.length === 0) {
			return undefined
		}

		return this.getNetwork(net).getChannel(name)
	}

	/**
	 * Try to get the data of a channel.
	 *
	 * @param {string} net The name of the network.
	 * @param {string} name The name of the channel.
	 * @returns {ChannelStore} The channel object. If no network or channel by
	 *                         the given names is found, this will return
	 *                         {@linkcode undefined}.
	 */
	tryGetChannel(net, name) {
		if (this.networks.hasOwnProperty(net)) {
			return this.networks[net].tryGetChannel(name)
		}
		return undefined
	}

	/**
	 * Store a channel object.
	 *
	 * @param {string} net The name of the network to put the channel in.
	 * @param {ChannelStore} chan The channel object.
	 */
	putChannel(net, chan) {
		this.getNetwork(net).putChannel(chan)
	}

	/**
	 * Get the channel list UI element.
	 *
	 * @returns {JQuery|undefined} The JQuery DOM object for
	 *                             {@linkcode div#networks}, or undefined if it
	 *                             isn't currently on the page.
	 */
	getChanlist() {
		const chanlist = this.mauirc.container.find("#networks")
		if (chanlist.length === 0) {
			return undefined
		}
		return chanlist
	}

	/**
	 * Get the chat area UI element.
	 *
	 * @returns {JQuery} The JQuery DOM object for
	 *                   {@linkcode div.chat-container > div.chat}, or undefined
	 *                   if it isn't currently on the page.
	 */
	getChatArea() {
		const chat = this.mauirc.container.find(".chat-container > .chat")
		if (chat.length === 0) {
			return undefined
		}
		return chat
	}

	/**
	 * Close the chat area.
	 */
	closeChatArea() {
		this.current.network = ""
		this.current.channel = ""
		const chat = this.getChatArea()
		if (chat !== undefined) {
			chat.empty()
		}
	}

	/**
	 * Deselect currently selected channels in the channel list.
	 */
	deselectChanlistEntries() {
		const chanlist = this.getChanlist()
		chanlist.find(".network.active").removeClass("active")
		chanlist.find(".network .channel.active").removeClass("active")
	}

	/**
	 * Process a data-related message from the server.
	 *
	 * @param {string} type The type of the message.
	 * @param {Object} data The data from the server.
	 */
	process(type, data) {
		let net
		let chan
		let first
		switch (type) {
		case "chandata":
			// Whether or not it's the first time the channel data is being
			// received.
			first = this.tryGetChannel(data.network, data.name) === undefined
			chan = this.getChannel(data.network, data.name)
			chan.topic = data.topic || data.name
			chan.topicsetat = data.topicsetat
			chan.topicsetby = data.topicsetby
			chan.users = data.userlist
			chan.modes = data.modes
			// If channel data is being received for the first time and the
			// same channel is open, re-open it since opening without channel
			// data fails.
			if (first && this.current.network === data.network &&
					this.current.channel === data.name) {
				this.mauirc.router.update()
			}
			chan.updateUserlist()
			chan.updateTopic()
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

module.exports = DataStore
