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
/* global Handlebars */

/**
 * A template system. See the {@link TemplateSystem} class for more info.
 *
 * @module lib/templates
 */
class TemplateSystem {
	/**
	 * Create a template system.
	 *
	 * @param {JQuery}     container  The container to put templates in by default.
	 * @param {Handlebars} handlebars The Handlebars instance to use. If
	 *                                undefined, the global Handlebars object
	 *                                will be used.
	 * @param {function}   globalFunc A function.
	 */
	constructor(container, handlebars, globalFunc) {
		this.container = container
		this.handlebars = handlebars || Handlebars
		this.globalFunc = globalFunc
		this.handlebars.partials = this.handlebars.templates
	}

	/**
	 * Check if a template exists.
	 *
	 * @param   {string} name The name of the template to check.
	 * @returns {bool}        Whether or not the template exists.
	 */
	exists(name) {
		return this.handlebars.templates.hasOwnProperty(name)
	}

	/**
	 * Get a certain template.
	 *
	 * @param   {string} name The name of the template to get.
	 * @returns {Template}    The template function.
	 */
	get(name) {
		return this.handlebars.templates[name]
	}

	/**
	 * Apply global variables to a template argument object.
	 *
	 * @param {Object|array|string|number|boolean} args The data.
	 * @returns {Object|array|string|number|boolean}    The data with globals.
	 */
	applyGlobals(args) {
		if (Array.isArray(args) || typeof args !== "object") {
			args = {
				".": args,
			}
		}
		return this.globalFunc ? this.globalFunc(args) : args
	}

	/**
	 * Override the contents of the object with a template.
	 *
	 * @param {string} name     The name of the template to use.
	 * @param {Object} [args]   The arguments to give to the template.
	 * @param {JQuery} [object] The object to apply the template to.
	 */
	apply(name, args, object) {
		if (object === undefined) {
			object = this.container
		}
		args = this.applyGlobals(args)
		object.html(this.handlebars.templates[name](args))
	}

	/**
	 * Append the contents of a template to the object.
	 *
	 * @param {string} name     The name of the template to use.
	 * @param {Object} [args]   The arguments to give to the template.
	 * @param {JQuery} [object] The object to append the template to.
	 */
	append(name, args, object) {
		if (object === undefined) {
			object = this.container
		}
		args = this.applyGlobals(args)
		object.append(this.handlebars.templates[name](args))
	}

	/**
	 * Prepend the contents of a template to the object.
	 *
	 * @param {string} name     The name of the template to use.
	 * @param {Object} [args]   The arguments to give to the template.
	 * @param {JQuery} [object] The object to prepend the template to.
	 */
	prepend(name, args, object) {
		if (object === undefined) {
			object = this.container
		}
		args = this.applyGlobals(args)
		object.prepend(this.handlebars.templates[name](args))
	}
}

module.exports = TemplateSystem
