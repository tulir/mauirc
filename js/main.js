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
const { Hashmux } = require("hashmux")
const $ = require("jquery")
const ContextmenuHandler = require("./contextmenu")
const EventSystem = require("./events")
const Auth = require("./auth")
const Connection = require("./conn")
const RawMessaging = require("./rawio")
const DataStore = require("./data")
/*
	global Handlebars
*/

global.VERSION = "2.1.0"

// Fixes to Handlebars
Handlebars.partials = Handlebars.templates

// Request notification permission
Notification.requestPermission()

class mauIRC {
	constructor() {
		this.container = $("#container")
		this.router = new Hashmux()
		this.contextmenu = new ContextmenuHandler(
			$("#contextmenu"), Handlebars.templates.contextmenu
		)
		this.events = new EventSystem(this)
		this.auth = new Auth(this)
		this.conn = new Connection(this)
		this.raw = new RawMessaging(this)
		this.data = new DataStore(this)
	}

	applyTemplate(name, args, object) {
		if (object === undefined) {
			object = this.container
		}
		object.html(Handlebars.templates[name](args))
	}

	appendTemplate(name, args, object) {
		if (object === undefined) {
			object = this.container
		}
		object.append(Handlebars.templates[name](args))
	}

	verifyConnection(func) {
		if (this.conn.ected) {
			if (func !== undefined) {
				func()
			}
			return true
		}
		if (this.auth.enticated) {
			window.location.hash = "#/connect"
		} else if (this.auth.checked) {
			window.location.hash = "#/login"
		} else {
			this.auth.check()
		}
		return false
	}

	listen() {
		this.router.handleError(404, data => {
			if (Handlebars.templates.hasOwnProperty(data.page.substr(1))) {
				this.applyTemplate(data.page.substr(1))
			} else {
				this.applyTemplate("error", {
					error: "Page not found",
					data: data.data,
				})
			}
		})

		this.router.handle("/", () => this.auth.check())
		this.router.handle("/login", () =>
			(this.auth.checked ?
				this.applyTemplate("login") :
				window.location.hash = "#/")
		)
		this.router.handle("/connect", () =>
			(this.conn.ected ?
				window.location.hash = "#/chat" :
				(this.auth.enticated ?
					this.conn.ect() :
					window.location.hash = "#/login"))
		)
		this.router.handle("/chat", () =>
			this.verifyConnection(() => this.data.openChat())
		)
		this.router.handle("/raw/{network}", data =>
			this.verifyConnection(() => this.raw.open(data.network))
		)
		this.router.listen()
	}
}

const $mauirc = new mauIRC()
$mauirc.listen()
