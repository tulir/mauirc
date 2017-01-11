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

/**
 * An event system. See the {@link EventSystem} class for more info.
 *
 * @module lib/events
 */
class EventSystem {
	/**
	 * Create an event system.
	 *
	 * @param {JQuery} container The container to bind the event listeners to.
	 */
	constructor(container) {
		this.container = container
		this.handlers = {}
		this.activate()
	}

	/**
	 * Register a click event listener.
	 *
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	click(evt, func) {
		this.on("click", evt, func)
	}

	/**
	 * Register a double-click event listener.
	 *
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	doubleclick(evt, func) {
		this.on("doubleclick", evt, func)
	}

	/**
	 * Register a blur event listener.
	 *
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	blur(evt, func) {
		this.on("blur", evt, func)
	}

	/**
	 * Register a keydown event listener.
	 *
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	keydown(evt, func) {
		this.on("keydown", evt, func)
	}

	/**
	 * Register a submit event listener.
	 *
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	submit(evt, func) {
		this.on("submit", evt, func)
	}

	/**
	 * Register a contextmenu event listener.
	 *
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	contextmenu(evt, func) {
		this.on("contextmenu", evt, func)
	}

	/**
	 * Register an event listener.
	 *
	 * @param {string} type The type of the event.
	 * @param {string} evt The name of the event.
	 * @param {func} func The function to execute when the event is triggered.
	 */
	on(type, evt, func) {
		evt = `${evt}:${type}`
		if (!this.handlers.hasOwnProperty(evt)) {
			this.handlers[evt] = []
		}
		this.handlers[evt].push(func)
	}

	/**
	 * Trigger an event.
	 *
	 * @param {string} evt The name and type of the event (name:type).
	 * @param {Event} source The source DOM event that caused this event.
	 * @param {DOM} obj The DOM object that this event happened on.
	 */
	exec(evt, source, obj) {
		if (!this.handlers.hasOwnProperty(evt)) {
			return
		}

		source.stopPropagation()

		for (const func of this.handlers[evt]) {
			func(obj, source)
		}
	}

	/**
	 * Fetch the name of the event from the DOM object and trigger the event.
	 *
	 * @param {string} evtType The type of the event.
	 * @param {DOM} obj The DOM object that this event happened on.
	 * @param {Event} source The source DOM event that caused this event.
	 */
	execRaw(evtType, obj, source) {
		this.exec(`${obj.getAttribute("data-event")}:${evtType}`, source, obj)
	}

	/**
	 * Register a jQuery event handler.
	 *
	 * @param {string} nativeEvent The name of the native event.
	 * @param {string} systemEvent The name of the internal event, or undefined
	 *                             to use the same as nativeEvent.
	 */
	registerNativeListener(nativeEvent, systemEvent) {
		const evsys = this
		systemEvent = systemEvent || nativeEvent
		this.container.on(nativeEvent,
				`*[data-event][data-listen~='${systemEvent}']`,
				function(event) { evsys.execRaw(systemEvent, this, event) })
	}
	/**
	 * Register jQuery event handlers.
	 */
	activate() {
		const evsys = this
		this.container.on("click",
				"*[data-event][data-listen~='click']," +
			"*[data-event]:not([data-listen])",
				function(event) {
					evsys.execRaw("click", this, event)
				}
		)
		this.registerNativeListener("dblclick", "doubleclick")
		this.registerNativeListener("blur")
		this.registerNativeListener("keydown")
		this.registerNativeListener("submit")
		this.registerNativeListener("contextmenu")
	}
}

module.exports = EventSystem
