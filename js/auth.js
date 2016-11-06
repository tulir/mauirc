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

class Auth {
	constructor(apiAddress) {
		this.apiAddress = apiAddress
		this.authenticated = false
		this.checkFailed = false
	}

	get enticated() {
		return this.authenticated
	}

	checkAnd(callback) {
		console.log("Checking authentication status...")
		jQuery.ajax({
			type: "GET",
			url: "/auth/check",
			dataType: "json"
		})
		.done(data => {
			this.checkFailed = false
			this.authenticated = data.authenticated
			if (data.authenticated) {
				callback(true)
			} else {
				callback(false)
			}
		})
		.fail((info, status, error) => {
			console.error("Auth check failed: HTTP " + info.status)
			console.error(info)
			this.checkFailed = true
			callback(false)
		})
	}

	login(email, password, callback) {
		jQuery.ajax({
			type: "POST",
			url: "/auth/login",
			data: JSON.stringify({email: email, password: password})
		})
		.done(data => {
			this.checkFailed = false
			this.authenticated = true
			callback(true)
		})
		.fail((info, status, error) => {
			this.checkFailed = false
			this.authenticated = false
			callback(false)
		})
	}
}
