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

class Message {
	constructor(mauirc, data) {
		this.initialize(data)
		this.parsePreview(data.preview)
		this.parseMessageType(data.command, data.message)
		this.parseHighlight(data.network)
		this.updateTemplateVariables()
	}

	save() {
		mauirc.data.getChannel(data.network, data.channel).receiveMessage(this)
	}

	initialize(data) {
		let momentDate = moment.unix(data.timestamp)
		this.sender = data.sender
		this.timestamp = data.timestamp
		this.date = momentDate.format("HH:mm:ss")
		this.dateFull = momentDate.format("dddd, D MMM YYYY (z)")
		this.id = data.id
		this.class = ["message"]
		this.wrapClass = ["message-wrapper"]
		this.highlight = false
		this.ownMsg = data.ownMsg
		this.tryJoin()
		// TODO this.message = linkify(escapeHTML(data.message))
		this.message = data.message
		this.plain = data.message
		this.isAction = true
	}

	parsePreview(preview) {
		this.preview = {hasText: false, hasImage: false}
		if (preview !== null && preview !== undefined) {
			if (preview.hasOwnProperty("image") && preview.image !== null) {
				this.preview.hasText = true
				this.preview.image = preview.image.url
			}
			if (preview.hasOwnProperty("text") && preview.text !== null) {
				this.preview.hasText = true
				this.preview.title = preview.text.title
				this.preview.description = preview.text.description
				this.preview.sitename = preview.text.sitename
			}
		}
	}

	parseHighlight(network) {
		// TODO highlights
	}

	updateTemplateVariables() {
		if (this.ownMsg) {
			this.class.push("own")
			this.wrapClass.push("own")
		}
		if (this.joined) {
			this.wrapClass.push("joined-with-prev")
		}
		this.class = this.class.join(" ")
		this.wrapClass = this.wrapClass.join(" ")
		// TODO this.message = decodeMessage(this.message)
	}

	parseMessageType(command, unescapedMessage) {
		switch(command.toLowerCase()) {
		case "action":
			this.class.push("user-action")
			this.plain = "* " + this.sender + " " + this.message
			return
		case "join":
			this.class = this.class.append(["secondary-action", "joinpart"])
			this.message = "joined " + this.message
			return
		case "part":
		case "quit":
			this.class = this.class.append(["secondary-action", "joinpart"])
			this.message = "left: " + this.message
			this.plain = this.sender + " " + this.message
			return
		case "kick":
			this.class = this.class.append(["secondary-action", "kick"])
			let index = unescapedMessage.indexOf(":")
			let kicker = this.sender
			let sender = unescapedMessage.substr(0, index)
			let message = unescapedMessage.substr(index+1)
			this.sender = sender
			this.message = sprintf(
				"was kicked by <b>%s</b>: <b>%s</b>",
				kicker, unescapedMessage // TODO linkify&escape message
			)
			this.plain = sprintf(
				"was kicked by %s: %s",
				kicker, unescapedMessage
			)
			return
		case "mode":
			this.class = this.class.append(["secondary-action", "modechange"])
			let parts = message.split(" ")
			if (parts.length > 1) {
				this.message = sprintf(
					"set mode <b>%s</b> for <b>%s</b>", parts[0], parts[1]
				)
				this.plain = sprintf(
					"set mode %s for %s", parts[0], parts[1]
				)
			} else {
				this.message = sprintf("set channel mode <b>%s</b>", parts[0])
				this.plain = sprintf("set channel mode %s", parts[0])
			}
			return
		case "nick":
			this.class = this.class.append(["secondary-action", "nickchange"])
			this.message = sprintf("is now known as <b>%s</b>", unescapedMessage)
			this.plain = sprintf("%s is now known as %s", unescapedMessage)
			return
		case "topic":
			this.class = this.class.append(["secondary-action", "nickchange"])
			this.message = sprintf(
				"changed the topic to <b>%s</b>", unescapedMessage
			)
			this.plain = sprintf(
				"%s changed the topic to %s", unescapedMessage
			)
			return
		default:
			this.isAction = false
			return
		}
	}

	notify() {
		if (!Notification.permission === "granted") {
			return
		}
		new Notification(sprintf("%s @ %s", sender, channel), {
			body: this.plain,
			icon: "favicon.ico"
		})
	}
}
