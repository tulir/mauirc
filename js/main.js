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
	}

	load() {
		registerPathHandlers()
		activateEvents()
	}

	registerEventHandler(evt, scope, func) {
		$(document).on("ranssi." + evt, (event, source) => {
			scope[func]()
			source.stopPropagation()
		})
	}

	activateEvents() {
		let ranssi = this
		$("*[data-event]").click(function(event) {
			$(document).trigger(
				"ranssi." + this.getAttribute("data-event") + ":click",
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

		// TODO
		//   /
		//   /login
		//   /settings
		this.router.listen()
	}
}

let $mauirc = new mauIRC()
$mauirc.load()
