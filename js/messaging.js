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

class Messaging {
	constructor(mauirc) {
		this.current = {
			network: "",
			channel: ""
		}
		this.mauirc = mauirc
		mauirc.events.submit("chat", () => {
			let chat = mauirc.data.getChatArea()
			this.send({
				message: $("#chat-input").val(),
				command: "privmsg",
				channel: chat.attr("data-channel"),
				network: chat.attr("data-network")
			})
			$("#chat-input").val("")
		})

		mauirc.events.click("vswitch.chat", () => this.openChat())
		mauirc.events.click("vswitch.channels", () => this.openChanlist())
		mauirc.events.click("vswitch.users", () => this.openUserlist())
	}

	openChat() {
		let chan = this.mauirc.data.getChannel(
			this.current.network, this.current.channel
		)
		if (chan === undefined) {
			chan = {users: [], messages: []}
		}
		this.mauirc.applyTemplate("chat", {
			networks: this.mauirc.data.networks,
			users: chan.users,
			messages: chan.messages,
			network: this.current.network,
			channel: this.current.channel,
		})
	}

	openUserlist() {
		this.mauirc.applyTemplate("userlist", this.mauirc.data.getChannel(
			this.current.network, this.current.channel
		))
	}

	openChanlist() {
		this.mauirc.applyTemplate("chanlist", this.mauirc.data)
	}

	receive(message) {
		let chan = this.mauirc.data.getChannel(message.network, message.channel)
		chan.open()
		chan.receiveMessage(message)
	}

	send(message) {
		this.mauirc.conn.send("message", message)
	}
}
