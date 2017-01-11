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
 * Authentication system.
 */
class Auth {
	/**
	 * Create an authentication system.
	 *
	 * @param {mauIRC} mauirc The mauIRC object to use.
	 */
	constructor(mauirc) {
		this.authenticated = false
		this.checkFailed = false
		this.checked = false
		this.mauirc = mauirc

		// TODO mauirc.events.click("auth.register", () => )
		mauirc.events.click("auth.login", () => this.login())
		mauirc.events.click("auth.forgot", () => this.forgot())
	}

	/**
	 * Shorthand for {@link Auth#authenticated}.
	 *
	 * @returns {bool} Whether or not the user has authenticated.
	 */
	get enticated() {
		return this.authenticated
	}

	/**
	 * Send a request to check if the user has authenticated.
	 */
	check() {
		if (this.checkFailed) {
			window.location.hash = "#/login"
			return
		}

		console.log("Checking authentication status...")
		$.ajax({
			type: "GET",
			url: "/auth/check",
			dataType: "json",
		}).done(data => {
			this.checkFailed = false
			this.authenticated = data.authenticated
			if (data.authenticated) {
				console.log("Already logged in!")
				window.location.hash = "#/connect"
			} else {
				console.log("Not logged in.")
				this.mauirc.nextPage = "#/chat"
				window.location.hash = "#/login"
			}
		}).fail(info => {
			console.error(`Auth check failed: HTTP ${info.status}`)
			console.error(info)
			this.mauirc.nextPage = "#/chat"
			window.location.hash = "#/login"
			this.checkFailed = true
		}).always(() => this.checked = true)
	}

	/**
	 * Try to log in.
	 *
	 * @param {string} [email] The email to log in using. If not given, the
	 *                         value of {@linkcode div#email} will be used.
	 * @param {string} [password] The password to log in using. If not given,
	 *                            the value of {@linkcode div#email} will be
	 *                            used.
	 */
	login(email, password) {
		$.ajax({
			type: "POST",
			url: "/auth/login",
			data: JSON.stringify({
				email: email || $("#email").val(),
				password: password || $("#password").val(),
			}),
		}).done(() => {
			this.checkFailed = false
			this.authenticated = true
			window.location.hash = "#/connect"
		}).fail(info => {
			this.checkFailed = false
			this.authenticated = false
			console.error("Login failed")
			console.error(info)
		}).always(() => this.checked = true)
	}

	/**
	 * Send a request to get a password reset link.
	 *
	 * TODO implement.
	 */
	forgot() {
		void (this)
	}
}

module.exports = Auth
