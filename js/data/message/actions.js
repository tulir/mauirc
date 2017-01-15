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
const linkifyHtml = require("linkifyjs/html")
const { escapeHtml } = require("./encoding")

const actionParsers = {
	action(msg) {
		msg.classArr.push("user-action")
		msg.plain = `* ${msg.sender} ${msg.message}`
	},
	join(msg) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("joinpart")
		msg.message = `joined ${msg.message}`
		msg.plain = `${msg.sender} ${msg.message}`
	},
	part(msg) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("joinpart")
		msg.message = `left: ${msg.message}`
		msg.plain = `${msg.sender} ${msg.message}`
	},
	quit: msg => actionParsers.part(msg),
	kick(msg, unescapedMessage) {
		msg.classArr = msg.classArr.concat(["secondary-action", "kick"])
		const index = unescapedMessage.indexOf(":")
		const kicker = msg.sender
		const sender = unescapedMessage.substr(0, index)
		const newMessage = unescapedMessage.substr(index + 1)
		msg.sender = sender
		msg.message = `was kicked by <b>${kicker}</b>: <b>${
				linkifyHtml(escapeHtml(newMessage))}</b>`
		msg.plain = `was kicked by ${kicker}: ${newMessage}`
	},
	mode(msg, unescapedMessage) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("modechange")
		const parts = unescapedMessage.split(" ")
		if (parts.length > 1) {
			msg.message = `set mode <b>${parts[0]}</b> for <b>${
					parts[1]}</b>`
			msg.plain = `set mode ${parts[0]} for ${parts[1]}"`
		} else {
			msg.message = `set channel mode <b>${parts[0]}</b>`
			msg.plain = `set channel mode ${parts[0]}`
		}
	},
	nick(msg) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("nickchange")
		msg.message = `is now known as <b>${msg.message}</b>`
		msg.plain = `${msg.sender} is now known as ${msg.message}`
	},
	topic(msg) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("topicchange")
		msg.message = `changed the topic to <b>${msg.message}</b>`
		msg.plain = `${msg.sender} changed the topic to ${
				msg.message}`
	},
	invited(msg) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("invite")
		msg.message = `Invited <b>${msg.message}</b> to the channel`
		msg.plain = `Invited ${msg.message} to the channel`
	},
	invitefail(msg) {
		msg.classArr.push("secondary-action")
		msg.classArr.push("invite")
		msg.message = `<b>${msg.message}</b> is already on the channel`
		msg.plain = `${msg.message} is already on the channel`
	},
}

module.exports = actionParsers
