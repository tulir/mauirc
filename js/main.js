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
const { Hashmux } = require("hashmux")
const $ = require("jquery")
const ContextmenuHandler = require("./lib/contextmenu")
const EventSystem = require("./lib/events")
const TemplateSystem = require("./lib/templates")
const Auth = require("./auth")
const Connection = require("./conn")
const RawMessaging = require("./rawio")
const DataStore = require("./data/store")

// Request notification permission
Notification.requestPermission()

/**
 * Main mauIRC class
 */
class mauIRC {
	/**
	 * Create a new instance of mauIRC.
	 */
	constructor() {
		this.container = $("#container")

		this.VERSION = "2.1.0"
		this.router = new Hashmux()
		this.templates = new TemplateSystem(this.container, undefined, args => {
			args.VERSION = this.VERSION
			return args
		})
		this.events = new EventSystem(this.container)
		this.contextmenu = new ContextmenuHandler(
			$("#contextmenu"), this.templates.get("contextmenu"))

		this.auth = new Auth(this)
		this.conn = new Connection(this)
		this.raw = new RawMessaging(this)
		this.data = new DataStore(this)

		this.nextPage = "#/chat"

		this.container.on("click", "*[data-href]:not([data-listen~='click'])",
				function() {
					window.location.hash = this.getAttribute("data-href")
				}
		)
	}

	/**
	 * Verify that a connection to the server has been established.
	 *
	 * @param {func} [func] The function to call if connected.
	 * @returns {bool} Whether or not the connection is open.
	 */
	verifyConnection(func) {
		if (this.conn.ected) {
			if (func !== undefined) {
				func()
			}
			return true
		}

		this.nextPage = window.location.hash
		if (this.auth.enticated) {
			window.location.hash = "#/connect"
		} else if (this.auth.checked) {
			this.nextPage = "#/chat"
			window.location.hash = "#/login"
		} else {
			this.auth.check()
		}
		return false
	}

	/**
	 * Register Hashmux handlers and activate the location hash change listener.
	 */
	listen() {
		this.router.handleError(404, data => {
			if (this.templates.exists(data.page.substr(1))) {
				this.templates.apply(data.page.substr(1))
			} else {
				this.templates.apply("error", {
					error: "Page not found",
					data: data.data,
				})
			}
		})

		this.router.handle("/", () => this.auth.check())
		this.router.handle("/login", () =>
				(this.auth.checked ?
					this.templates.apply("login") :
					window.location.hash = "#/"))
		this.router.handle("/connect", () =>
				(this.conn.ected ?
					window.location.hash = this.nextPage || "#/chat" :
					(this.auth.enticated ?
						this.conn.ect() :
						window.location.hash = "#/login")))
		this.router.handle("/channels", () =>
				this.verifyConnection(() => this.data.openChanlist()))
		this.router.handle("/chat/{network}/{channel}", data =>
				this.verifyConnection(() =>
					this.data.openChat(data.network, data.channel)))
		this.router.handle("/chat/", () =>
				this.verifyConnection(() => this.data.openChat()))
		this.router.handle("/users/{network}/{channel}", data =>
				this.verifyConnection(() =>
					this.data.openUserlist(data.network, data.channel)))
		this.router.handle("/users//", () => window.location.href = "#/chat")
		this.router.handle("/raw/{network}", data =>
				this.verifyConnection(() => this.raw.open(data.network)))
		this.router.handle("/raw/", () => window.location.href = "#/chat")
		this.router.listen()
	}
}

global.$mauirc = new mauIRC()
global.$mauirc.listen()
