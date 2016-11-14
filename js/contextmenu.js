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
const $ = require("jquery")

module.exports = class ContextmenuHandler {
	constructor(div, template) {
		this.container = div
		const cmxHandler = this
		this.container.on("click", "*[data-context-id]", function(event) {
			cmxHandler.click(event, this)
		})
		this.template = template
		this.funcs = {}
	}

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

		event.stopPropagation()
		event.preventDefault()
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

	click(event, object) {
		const id = object.getAttribute("data-context-id")
		event.stopPropagation()
		this.funcs[id](id)
	}

	close() {
		this.container.empty()
		this.funcs = []
	}
}
