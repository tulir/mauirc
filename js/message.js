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
const moment = require("moment")
const linkifyHtml = require("linkifyjs/html")

const encoders = [
	{ // Italic
		regex: /_([^_]*)_/g,
		replacement: "\x1D$1\x1D",
	}, { // Bold
		regex: /\*([^*]*)\*/g,
		replacement: "\x02$1\x02",
	}, { // Underline
		regex: /~([^~]*)~/g,
		replacement: "\x1F$1\x1F",
	}, { // Background & Foreground color
		regex: /c(1[0-5]|[0-9])>([^<]*)</g,
		replacement: "\x03$1$2",
	}, { // Foreground color only
		regex: /c(1[0-5]|[0-9]),(1[0-5]|[0-9])>([^<]*)</g,
		replacement: "\x03$1,$2$3",
	},
]

const decoders = [
	{ // Italic
		regex: /\x1D([^\x1D]*)?\x1D?/g,
		replacement: "<i>$1</i>",
	}, { // Bold
		regex: /"\x02([^\x02]*)?\x02?"/g,
		replacement: "<b>$1</b>",
	}, { // Underline
		regex: /"\x1F([^\x1F]*)?\x1F?"/g,
		replacement: "<u>$1</u>",
	}, { // Monospace
		regex: /"`([^`]*)`"/g,
		replacement: "<tt>$1</tt>",
	}, { // Background & Foreground color
		regex: /"\x03(1[0-5]|[0-9]),(1[0-5]|[0-9])([^\x03]*)?\x03?"/g,
		replacement: "<span style='color: $1; background-color: $2;'>$3</span>",
	}, { // Foreground color only
		regex: /"\x03(1[0-5]|[0-9])([^\x03]*)?\x03?"/g,
		replacement: "<span style='color: $1;'>$2</span>",
	},
]

/**
 * A message object.
 */
class Message {
	/**
	 * Parse a Message from a server-sent object.
	 *
	 * @param {string} channel The name of the channel the message is on.
	 * @param {Object} [data] The data to parse the message from.
	 * @param {Integer} prevID The ID of the previous message on the channel.
	 * @param {bool} isNew Whether or not this is not from history.
	 */
	constructor(channel, data, prevID, isNew) {
		this.mauirc = channel.mauirc
		this.datastore = channel.datastore
		this.network = channel.network
		this.channel = channel
		this.previousID = prevID
		this.isNew = isNew

		if (data !== undefined) {
			this.initialize(data)
			this.register()
			this.parsePreview(data.preview)
			this.parseMessageType(data.command, data.message)
			this.parseHighlight(data.network)

			if (this.ownMsg) {
				this.classArr.push("own")
				this.wrapClassArr.push("own")
			}
			this.message = Message.decodeIRC(this.message)
		}
	}

	/**
	 * Escape HTML special characters.
	 *
	 * @param {string} str The string to escape.
	 * @returns {string} A escaped string.
	 */
	static escapeHtml(str) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&apos;")
	}

	/**
	 * Encode human-writable formatting into IRC format.
	 *
	 * @param {string} str The string to encode.
	 * @returns {string} A string with the same formattings in IRC encoding.
	 */
	static encodeIRC(str) {
		for (const enc of encoders) {
			str = str.replace(enc.regex, enc.replacement)
		}
		return str
	}

	/**
	 * Decode IRC-encoded formattings into HTML.
	 *
	 * @param {string} str The string to decode.
	 * @returns {string} A string with the same formattings as HTML.
	 */
	static decodeIRC(str) {
		for (const dec of decoders) {
			str = str.replace(dec.regex, dec.replacement)
		}
		return str
	}

	/**
	 * Get the classes for this message object.
	 *
	 * @returns {string} The HTML class attribute value.
	 */
	get class() {
		return this.classArr.join(" ")
	}

	/**
	 * Get the classes for the wrapper of this message object.
	 *
	 * @returns {string} The HTML class attribute value for the wrapper.
	 */
	get wrapClass() {
		return this.wrapClassArr.join(" ")
	}

	/**
	 * Get the jQuery DOM element wrapping this message.
	 *
	 * @returns {JQuery|undefined} The jQuery DOM element,
	 *                             or undefined if not found.
	 */
	getUIElement() {
		const chat = this.channel.getChatArea()
		if (chat === undefined) {
			return undefined
		}

		const msg = chat.find(`.message-wrapper[data-id=${this.id}]`)
		if (msg.length === 0) {
			return undefined
		}

		return msg
	}

	/**
	 * Initialize the message with server-sent data.
	 *
	 * @param {Object} data The data to initialize the message with.
	 */
	initialize(data) {
		const momentDate = moment.unix(data.timestamp)
		this.sender = data.sender
		this.timestamp = data.timestamp
		this.date = momentDate.format("HH:mm:ss")
		this.dateFull = momentDate.format("dddd, D MMM YYYY")
		this.id = data.id
		this.classArr = []
		this.wrapClassArr = []
		this.highlight = false
		this.ownMsg = data.ownmsg
		this.joined = this.tryJoin()
		this.message = linkifyHtml(Message.escapeHtml(data.message))
		this.plain = data.message
		this.isAction = true
	}

	/**
	 * Register this message into the data store messagePointers array.
	 */
	register() {
		this.datastore.messagePointers[this.id] = {
			network: this.network.name,
			channel: this.channel.name,
		}
	}

	/**
	 * Try to join this message with the previous message if both messages were
	 * sent by the same user.
	 *
	 * @returns {bool} Whether or not joining was successful.
	 */
	tryJoin() {
		const prevMsg = this.channel.messages[this.previousID]
		if (prevMsg !== undefined && prevMsg.sender === this.sender) {
			if (!prevMsg.wrapClass.includes("joined")) {
				prevMsg.wrapClassArr.push("joined")
			}
			prevMsg.wrapClassArr.push("next")
			this.wrapClassArr.push("joined")
			this.wrapClassArr.push("prev")
			const prevMsgUI = prevMsg.getUIElement()
			if (prevMsgUI !== undefined) {
				prevMsgUI.addClass("joined")
				prevMsgUI.addClass("next")
			}
			return true
		}
		return false
	}

		/**
		 * Parse preview data.
		 *
		 * @param {Object} preview The data.
		 */
	parsePreview(preview) {
		this.preview = { hasText: false, hasImage: false }
		if (preview !== null && preview !== undefined) {
			if (preview.hasOwnProperty("image") && preview.image !== null) {
				this.preview.hasImage = true
				this.preview.image = preview.image.url.replace(
					/^http:/, "https:"
				)
			}
			if (preview.hasOwnProperty("text") && preview.text !== null) {
				this.preview.hasText = true
				this.preview.title = preview.text.title
				this.preview.description = preview.text.description
				this.preview.sitename = preview.text.sitename
			}
		}
	}

	/**
	 * TODO docs & implementation.
	 *
	 * @param {Object} network TODO???.
	 */
	parseHighlight(network) {
		void (network, this.preview)
	}

	/**
	 * Parse the message type and apply appropriate classes and other details.
	 *
	 * @param {string} command The IRC command of the message.
	 * @param {string} unescapedMessage The unescaped/linkified message.
	 */
	parseMessageType(command, unescapedMessage) {
		switch (command.toLowerCase()) {
		case "action":
			this.classArr.push("user-action")
			this.plain = `* ${this.sender} ${this.message}`
			return
		case "join":
			this.classArr.push("secondary-action")
			this.classArr.push("joinpart")
			this.message = `joined ${this.message}`
			this.plain = `${this.sender} ${this.message}`
			return
		case "part":
		case "quit":
			this.classArr.push("secondary-action")
			this.classArr.push("joinpart")
			this.message = `left: ${this.message}`
			this.plain = `${this.sender} ${this.message}`
			return
		case "kick": {
			this.classArr = this.classArr.concat(["secondary-action", "kick"])
			const index = unescapedMessage.indexOf(":")
			const kicker = this.sender
			const sender = unescapedMessage.substr(0, index)
			const newMessage = unescapedMessage.substr(index + 1)
			this.sender = sender
			this.message = `was kicked by <b>${kicker}</b>: <b>${
				linkifyHtml(Message.escapeHtml(newMessage))
			}</b>`
			this.plain = `was kicked by ${kicker}: ${newMessage}`
			return
		}
		case "mode": {
			this.classArr.push("secondary-action")
			this.classArr.push("modechange")
			const parts = unescapedMessage.split(" ")
			if (parts.length > 1) {
				this.message = `set mode <b>${parts[0]}</b> for <b>${
					parts[1]}</b>`
				this.plain = `set mode ${parts[0]} for ${parts[1]}"`
			} else {
				this.message = `set channel mode <b>${parts[0]}</b>`
				this.plain = `set channel mode ${parts[0]}`
			}
			return
		}
		case "nick":
			this.classArr.push("secondary-action")
			this.classArr.push("nickchange")
			this.message = `is now known as <b>${unescapedMessage}</b>`
			this.plain = `${this.sender} is now known as ${unescapedMessage}`
			return
		case "topic":
			this.classArr.push("secondary-action")
			this.classArr.push("topicchange")
			this.message = `changed the topic to <b>${unescapedMessage}</b>`
			this.plain = `${this.sender} changed the topic to ${
				unescapedMessage}`
			return
		default:
			this.isAction = false
		}
	}

	/**
	 * Create a desktop notification of this message.
	 * Does nothing if {@#isNew} is false.
	 */
	notify() {
		if (!this.isNew || !Notification.permission === "granted") {
			return
		}
		new Notification(`${this.sender} @ ${this.channel.name}`, {
			body: this.plain,
			icon: "favicon.ico",
		})
	}

	/**
	 * Request the server to delete this message.
	 */
	delete() {
		this.mauirc.conn.send("delete", this.id)
	}

	/**
	 * Destroy this message object (remove from UI and remove all pointers).
	 */
	destroy() {
		$(`#msgwrap-${this.id}`).remove()
		delete this.datastore.messagePointers[this.id]
		delete this.channel.messages[this.id]
	}

	/**
	 * Check if this message is selected.
	 *
	 * @returns {boolean} Whether or not the message is selected.
	 */
	get selected() {
		return $(`#msg-${this.id}`).hasClass("selected")
	}

	/**
	 * Select this message object (highlight and action grouping).
	 */
	select() {
		$(`#msg-${this.id}`).addClass("selected")
	}

	/**
	 * Deselect this message object.
	 */
	deselect() {
		$(`#msg-${this.id}`).removeClass("selected")
	}

	/**
	 * Run a certain Message class function for each selected message.
	 *
	 * @param {string} funcName The name of the function to execute.
	 */
	forEachSelected(funcName) {
		const channel = this.channel
		$(".selected").each(function() {
			const message =
				channel.messages[+this.parentElement.getAttribute("data-id")]
			message[funcName]()
		})
	}

	/**
	 * Get the context menu object for this message that should be used when you
	 * have multiple messages selected.
	 *
	 * @returns {ContextMenuData} The contextmenu data, or undefined if no
	 *                            messages are selected.
	 */
	get selectedContextmenu() {
		if ($(".selected").length === 0) {
			return undefined
		}

		const ctxMenu = {}

		if (this.selected) {
			ctxMenu.deselect = {
				name: "Deselect",
				exec: () => this.deselect(),
			}
		} else {
			ctxMenu.deselect = {
				name: "Select",
				exec: () => this.select(),
			}
		}

		ctxMenu.deselectAll = {
			name: "Deselect all",
			exec: () => this.forEachSelected("deselect"),
		}

		ctxMenu.delete = {
			name: "Delete selected",
			exec: () => this.forEachSelected("delete"),
		}

		return ctxMenu
	}

	/**
	 * Get the context menu object for this message.
	 *
	 * @returns {ContextMenuData} The contextmenu data.
	 */
	get contextmenu() {
		return {
			select: {
				name: "Select",
				exec: () => this.select(),
			},
			copy: {
				name: "Copy text",
				exec: () => {
					const obj = $(`#msgwrap-${this.id}`)
					let textObj = obj.find(".message > .text")
					if (textObj.length === 0) {
						textObj = obj.find(".clipboard-data")
						if (textObj.length === 0) {
							console.warn("Failed to copy: Text not found!")
							return
						}
					}

					let wasHidden = false
					if (textObj.hasClass("hidden")) {
						textObj.removeClass("hidden")
						wasHidden = true
					}

					const selection = window.getSelection()
					const range = document.createRange()
					range.selectNodeContents(textObj[0])
					selection.removeAllRanges()
					selection.addRange(range)
					document.execCommand("copy")
					selection.removeAllRanges()

					if (wasHidden) {
						textObj.addClass("hidden")
					}
				},
			},
			reply: {
				name: "Reply (highlight)",
				exec: () => {
					$("#chat-input").val(
							`${this.sender}: ${$("#chat-input").val()}`)
					$("#chat-input").focus()
				},
			},
			delete: {
				name: "Delete",
				exec: () => this.delete(),
			},
			/*hide: {
				name: "Hide",
				exec: () => this.destroy(),
			},*/
		}
	}
}

module.exports = Message
