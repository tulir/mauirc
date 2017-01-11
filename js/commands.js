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
const Message = require("./data/message")

/**
 * Command system.
 */
class CommandSystem {
	/**
	 * Construct a command system.
	 *
	 * @param {mauIRC} mauirc The mauIRC instance.
	 */
	constructor(mauirc) {
		this.mauirc = mauirc
		this.commands = [
			{
				aliases: ["msg", "message", "privmsg", "pm"],
				func: this.privateMessage,
			}, {
				aliases: ["query", "q"],
				func: this.query,
			}, {
				aliases: ["join", "enter"],
				func: this.join,
			}, {
				aliases: ["part", "leave", "exit"],
				func: this.part,
			}, {
				aliases: ["me", "action"],
				func: this.action,
			}, {
				aliases: ["switch", "channel"],
				func: this.switch,
			},
		]

		this.listCache = this.list()
	}

	/**
	 * Get a list of all commands.
	 *
	 * @returns {string[]} The full list of commands and all their aliases.
	 */
	list() {
		let commands = []
		for (const handler of this.commands) {
			commands = commands.concat(handler.aliases)
		}
		this.commandList = commands
		return this.commandList
	}

	/**
	 * Handle a command from the user.
	 *
	 * @param {string}   cmd  The command that was executed.
	 * @param {string[]} args The arguments.
	 */
	handle(cmd, args) {
		for (const handler of this.commands) {
			if (handler.aliases.includes(cmd)) {
				handler.func.call(this, args)
			}
		}
	}

	/**
	 * A command handler.
	 *
	 * @param   {string[]} args The arguments.
	 * @returns {bool}          Whether or not the arguments were valid.
	 */
	privateMessage(args) {
		if (args.length < 2) {
			return false
		}
		this.mauirc.conn.send("message", {
			message: Message.encodeIRC(args.slice(1).join(" ")),
			command: "privmsg",
			channel: args[0],
			network: this.mauirc.data.current.network,
		})
		return true
	}

	/**
	 * A command handler.
	 *
	 * @param   {string[]} args The arguments.
	 * @returns {bool}          Whether or not the arguments were valid.
	 */
	query(args) {
		if (args.length === 1) {
			this.getChannel(this.mauirc.data.current.network, args[0])
		} else if (args.length !== 1) {
			this.mauirc.conn.send("message", {
				message: Message.encodeIRC(args.slice(1).join(" ")),
				command: "privmsg",
				channel: args[0],
				network: this.mauirc.data.current.network,
			})
		} else {
			return false
		}
		return true
	}

	/**
	 * A command handler.
	 *
	 * @param   {string[]} args The arguments.
	 * @returns {bool}          Whether or not the arguments were valid.
	 */
	join(args) {
		if (args.length < 1) {
			return false
		}
		this.getNetwork(this.mauirc.data.current.network).join(args[0])
		return true
	}

	/**
	 * A command handler.
	 *
	 * @param   {string[]} args The arguments.
	 * @returns {bool}          Whether or not the arguments were valid.
	 */
	part(args) {
		if (args.length === 0) {
			const chan = this.tryGetChannel(
					this.mauirc.data.current.network,
					this.mauirc.data.current.channel)
			if (chan) {
				chan.part()
				return true
			}
		} else if (args.length === 1) {
			const chan = this.tryGetChannel(
					this.mauirc.data.current.network, args[0])
			if (chan) {
				chan.part()
				return true
			}
		} else {
			let chan
			let msg
			const net = this.tryGetNetwork(args[0])
			if (net) {
				chan = net.tryGetChannel(args[1])
				msg = args.slice(2).join(" ")
			} else {
				chan = net.tryGetChannel(args[0])
				msg = args.slice(1).join(" ")
			}
			if (chan) {
				chan.part(msg.length > 0 ? msg : undefined)
				return true
			}
		}
		return false
	}

	/**
	 * A command handler.
	 *
	 * @param   {string[]} args The arguments.
	 * @returns {bool}          Whether or not the arguments were valid.
	 */
	action(args) {
		this.mauirc.conn.send("message", {
			message: Message.encodeIRC(args.join(" ")),
			command: "action",
			channel: this.mauirc.data.current.channel,
			network: this.mauirc.data.current.network,
		})
		return true
	}

	/**
	 * A command handler.
	 *
	 * @param   {string[]} args The arguments.
	 * @returns {bool}          Whether or not the arguments were valid.
	 */
	switch(args) {
		if (args.length === 1) {
			window.location.hash =
					`#/chat/${this.mauirc.data.current.network}/${args[0]}`
		} else if (args.length === 2) {
			window.location.hash = `#/chat/${args[0]}/${args[1]}`
		} else {
			return false
		}
		return true
	}
}

module.exports = CommandSystem
