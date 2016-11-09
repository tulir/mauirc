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

class EventSystem {
	constructor(mauirc) {
		this.mauirc = mauirc
		this.eventContainer = $("<div id='eventcontainer'></div>")
		this.activate()
	}

	click(evt, func) {
		this.on(evt + ":click", func)
	}

	submit(evt, func) {
		this.on(evt + ":submit", func)
	}

	on(evt, func) {
		this.eventContainer.on("mauirc." + evt, (event, sourceEvent, obj) => {
			func(obj, sourceEvent, event)
			sourceEvent.stopPropagation()
		})
	}

	activate() {
		this.mauirc.container.on("click", "*[data-event]", function(event) {
			this.eventContainer.trigger(
				"mauirc." + this.getAttribute("data-event") + ":click",
				[event, this]
			)
		})
		this.mauirc.container.on("submit", "*[data-event][data-event-type='submit']", function(event) {
			this.eventContainer.trigger(
				"mauirc." + this.getAttribute("data-event") + ":submit",
				[event, this]
			)
		})
	}
}
