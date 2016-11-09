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
const VERSION = "2.1.0"

// Fixes to Handlebars
Handlebars.partials = Handlebars.templates

// Request notification permission
Notification.requestPermission()

class mauIRC {
	constructor() {
		this.container = $("#container")
		this.router = new Hashmux()
		this.auth = new Auth(this)
		this.conn = new Connection(this)
		this.msg = new Messaging(this)
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

	load() {
		this.registerPathHandlers()
		this.activateEvents()
	}

	registerEventHandler(evt, func) {
		$("#eventcontainer").on("mauirc." + evt, (event, sourceEvent, obj) => {
			func(obj, sourceEvent, event)
			sourceEvent.stopPropagation()
		})
	}

	activateEvents() {
		$("#container").on("click", "*[data-event]", function(event) {
			$("#eventcontainer").trigger(
				"mauirc." + this.getAttribute("data-event") + ":click",
				[event, this]
			)
		})
		$("#container").on("submit", "*[data-event][data-event-type='submit']", function(event) {
			$("#eventcontainer").trigger(
				"mauirc." + this.getAttribute("data-event") + ":submit",
				[event, this]
			)
		})
	}

	verifyConnection(func) {
		if (this.conn.ected) {
			if (func !== undefined) {
				func()
			}
			return true
		} else {
			if (this.auth.enticated) {
				window.location.hash = "#/connect"
			} else if (this.auth.checked) {
				window.location.hash = "#/login"
			} else {
				this.auth.check()
			}
			return false
		}
	}

	registerPathHandlers() {
		this.router.handleError(404, data => {
			if (Handlebars.templates.hasOwnProperty(data.page.substr(1))) {
				this.applyTemplate(data.page.substr(1))
			} else {
				this.applyTemplate("error", {
					error: "Page not found",
					data: data.data
				})
			}
		})

		this.router.handle("/", () => this.auth.check())
		this.router.handle("/login", () =>
			this.auth.checked ?
				this.applyTemplate("login") :
				window.location.hash = "#/"
		)
		this.router.handle("/connect", () =>
			this.conn.ected ?
				window.location.hash = "#/chat" :
				this.auth.enticated ?
					this.conn.ect() :
					window.location.hash = "#/login"
		)
		this.router.handle("/chat", () =>
			this.verifyConnection(() =>
				this.applyTemplate("chat", {networks: this.data.networks})
			)
		)
		this.router.handle("/raw/{network}", data =>
			this.verifyConnection(() => this.raw.open(data.network))
		)
		this.router.listen()
	}
}

let $mauirc = new mauIRC()
$mauirc.load()
