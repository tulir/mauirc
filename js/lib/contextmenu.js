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

/**
 * Context menu handler.
 *
 * @module lib/contextmenu
 */
class ContextmenuHandler {
	/**
	 * Create a context menu handler.
	 *
	 * @param {JQuery} div The container to use for the context menus.
	 * @param {func} template The function to generate the HTML of context menu
	 *                        entries.
	 */
	constructor(div, template) {
		this.container = div
		const cmxHandler = this
		this.container.on("click", "*[data-context-id]", function(event) {
			cmxHandler.click(event, this)
		})
		$(document).contextmenu(() => this.close())
		$(document).click(event => (event.which === 1 ? this.close() : 0))
		this.template = template
		this.funcs = {}
	}

	/**
	 * Open a context menu.
	 *
	 * @param {Object} data The context menu specification.
	 * @param {Event} event The DOM event, or optionally an object with the
	 *                      fields {@linkplain pageX} and {@linkplain pageY}
	 *                      indicating where the user clicked.
	 */
	open(data, event) {
		const templateData = []
		for (const key in data) {
			if (!data.hasOwnProperty(key)) {
				continue
			}
			const obj = data[key]
			templateData.push({
				id: key,
				text: obj.name,
			})
			this.funcs[key] = obj.exec
		}

		this.container.html(this.template(templateData))

		if (typeof event.stopPropagation === "function") {
			event.stopPropagation()
		}
		if (typeof event.preventDefault === "function") {
			event.preventDefault()
		}
		let x = event.pageX
		let y = event.pageY

		if (x + this.container.width() > $(window).width()) {
			x -= this.container.width()
		}
		if (y + this.container.height() > $(window).height()) {
			y -= this.container.height()
		}

		this.container.css({
			top: y,
			left: x,
		})
	}

	/**
	 * An internal contextmenu click handler.
	 *
	 * @private
	 * @param {Event} event The DOM click event.
	 * @param {DOM} object The DOM object clicked.
	 */
	click(event, object) {
		const id = object.getAttribute("data-context-id")
		event.stopPropagation()
		this.funcs[id](id)
		this.close()
	}

	/**
	 * Close the context menu.
	 */
	close() {
		this.container.empty()
		this.funcs = {}
	}
}

module.exports = ContextmenuHandler
