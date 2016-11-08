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

class DataStore {
	constructor() {
		this.networks = {}
	}

	getNetwork(name) {
		if (!this.networks.hasOwnProperty(name)) {
			this.putNetwork(new NetworkStore(name))
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

	process(type, data) {
		let net
		switch(type) {
		case "chandata":
			let chan = new ChannelStore(data.name)
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
	constructor(name) {
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

	getChannel(name) {
		if (!this.channels.hasOwnProperty(name)) {
			this.putChannel(new ChannelStore(name))
		}

		return this.channels[name]
	}

	putChannel(channel) {
		this.channels[channel.name] = channel
	}
}

class ChannelStore {
	constructor(name) {
		this.name = name
		this.users = []
		this.topic = ""
		this.topicsetat = 0
		this.topicsetby = ""
		this.modes = undefined
	}
}
