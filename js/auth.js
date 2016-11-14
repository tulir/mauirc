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
const $ = require("jquery")

module.exports = class Auth {
	constructor(mauirc, apiAddress) {
		this.apiAddress = apiAddress
		this.authenticated = false
		this.checkFailed = false
		this.checked = false

		// TODO mauirc.events.click("auth.register", () => )
		mauirc.events.click("auth.login", () => this.login())
		mauirc.events.click("auth.forgot", () => this.forgot())
	}

	get enticated() {
		return this.authenticated
	}

	check() {
		if (this.checkFailed) {
			window.location.hash = "#/login"
			return
		}

		console.log("Checking authentication status...")
		$.ajax({
			type: "GET",
			url: "/auth/check",
			dataType: "json"
		})
		.done(data => {
			this.checkFailed = false
			this.authenticated = data.authenticated
			if (data.authenticated) {
				console.log("Already logged in!")
				window.location.hash = "#/connect"
			} else {
				console.log("Not logged in.")
				window.location.hash = "#/login"
			}
		})
		.fail(info => {
			console.error("Auth check failed: HTTP " + info.status)
			console.error(info)
			window.location.hash = "#/login"
			this.checkFailed = true
		})
		.always(() => this.checked = true)
	}

	login() {
		$.ajax({
			type: "POST",
			url: "/auth/login",
			data: JSON.stringify({
				email: $("#email").val(),
				password: $("#password").val()
			})
		})
		.done(() => {
			this.checkFailed = false
			this.authenticated = true
			window.location.hash = "#/connect"
		})
		.fail(info => {
			this.checkFailed = false
			this.authenticated = false
			console.error("Login failed")
			console.error(info)
		})
		.always(() => this.checked = true)
	}

	forgot() {
		// TODO request reset link to email
	}
}
