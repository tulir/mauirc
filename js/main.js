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
		this.container = $("#container")
		this.router = new Hashmux()
		this.auth = new Auth(this)
	}

	load() {
		this.registerPathHandlers()
		this.activateEvents()
	}

	registerEventHandler(evt, func) {
		$(document).on("mauirc." + evt, (event, source) => {
			func()
			source.stopPropagation()
		})
	}

	activateEvents() {
		let ranssi = this
		$(document).on("click", "*[data-event]", function(event) {
			$(document).trigger(
				"mauirc." + this.getAttribute("data-event") + ":click",
				[event, ranssi]
			)
		})
	}

	registerPathHandlers() {
		this.router.handleError(404, data =>
			$("#container").html(Handlebars.templates.error({
				error: "Page not found",
				data: data.data
			}))
		)

		this.router.handle("/", () => this.auth.check())
		this.router.handle("/login", () => {
			if (!this.auth.checked) {
				window.location.hash = "#/"
			} else {
				$("#container").html(Handlebars.templates.login())
			}
		})
		this.router.handle("/forgot-password", () =>
			$("#container").html(Handlebars.templates.forgotPassword())
		)
		this.router.listen()
	}
}

let $mauirc = new mauIRC()
$mauirc.load()
