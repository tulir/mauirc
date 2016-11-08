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

// Fixes to Handlebars
Handlebars.partials = Handlebars.templates
Handlebars.registerHelper('ifCond', function(val1, operator, val2, options) {
	switch(operator) {
	case "==":  return (v1 == v2  ? options.fn(this) : options.inverse(this))
	case "!=":  return (v1 != v2  ? options.fn(this) : options.inverse(this))
	case "===": return (v1 === v2 ? options.fn(this) : options.inverse(this))
	case "!==": return (v1 !== v2 ? options.fn(this) : options.inverse(this))
	case "<":   return (v1 < v2   ? options.fn(this) : options.inverse(this))
	case ">":   return (v1 > v2   ? options.fn(this) : options.inverse(this))
	case "<=":  return (v1 <= v2  ? options.fn(this) : options.inverse(this))
	case ">=":  return (v1 >= v2  ? options.fn(this) : options.inverse(this))
	case "&&":  return (v1 && v2  ? options.fn(this) : options.inverse(this))
	case "||":  return (v1 || v2  ? options.fn(this) : options.inverse(this))
	default:    return options.inverse(this)
	}
})

class mauIRC {
	constructor() {
		this.container = $("#container")
		this.router = new Hashmux()
		this.auth = new Auth(this)
		this.conn = new Connection(this)
		this.msg = new Messaging(this)
		this.raw = new RawMessaging(this)
		this.data = new DataStore()
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
		$("#container").on("click", "*[data-event]", function(event) {
			$("#eventcontainer").trigger(
				"mauirc." + this.getAttribute("data-event") + ":click",
				[event, mauirc]
			)
		})
		$("#container").on("submit", "*[data-event][data-event-type='submit']", function(event) {
			$("#eventcontainer").trigger(
				"mauirc." + this.getAttribute("data-event") + ":submit",
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
				this.applyTemplate("chat", {networks: this.data.networks}) :
				this.auth.enticated ?
					window.location.hash = "#/connect" :
					window.location.hash = "#/login"
		)
		this.router.handle("/connect", () =>
			this.conn.ected ?
				window.location.hash = "#/chat" :
				this.auth.enticated ?
					this.conn.ect() :
					window.location.hash = "#/login"
		)
		this.router.handle("/raw/{network}", data =>
			this.conn.ected ?
				this.raw.open(data.network) :
				this.auth.enticated ?
					window.location.hash = "#/connect" :
					window.location.hash = "#/login"
		)
		this.router.listen()
	}
}

let $mauirc = new mauIRC()
$mauirc.load()
