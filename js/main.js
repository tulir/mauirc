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
const VERSION = "2.1.0"

class mauIRC {
	constructor() {
		Handlebars.partials = Handlebars.templates
		this.container = $("#container")
		this.router = new Hashmux()
		this.auth = new Auth(this)
		this.conn = new Connection(this)
	}

	applyTemplate(name, args) {
		this.container.html(Handlebars.templates[name](args))
	}

	load() {
		this.registerPathHandlers()
		this.activateEvents()
	}

	registerEventHandler(evt, func) {
		$("#eventcontainer").on("mauirc." + evt, (event, source) => {
			func()
			source.stopPropagation()
		})
	}

	activateEvents() {
		let mauirc = this
		$(document).on("click", "*[data-event]", function(event) {
			$("#eventcontainer").trigger(
				"mauirc." + this.getAttribute("data-event") + ":click",
				[event, mauirc]
			)
		})
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
		this.router.handle("/chat", () =>
			this.conn.ected ?
				this.applyTemplate("chat") :
				window.location.hash = "#/connect"
		)
		this.router.handle("/connect", () =>
			this.conn.ected ?
				window.location.hash = "#/chat" :
				this.auth.enticated ?
					this.conn.ect() :
					window.location.hash = "#/login"
		)
		this.router.handle("/forgot-password", () =>
			this.applyTemplate("forgotPassword")
		)
		this.router.listen()
	}
}

let $mauirc = new mauIRC()
$mauirc.load()
