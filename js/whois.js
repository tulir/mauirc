// mauIRC - The original mauIRC web frontend
// Copyright (C) 2016 Tulir Asokan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


function openWhoisModal(data) {
	if (data.idle === 0) {
		data.idle = "Currently online"
	} else {
		data.idle = moment().seconds(-data.idle).fromNow()
		data.idle = data.idle.charAt(0).toUpperCase() + data.idle.slice(1)
	}
	$("#modal").loadTemplate($("#template-whois"), data, {append: false, isFile: false, async: false})
	if (data.away.length === 0) {
		$("#whois-data-awaymessage").remove()
	}
	showModal()
}
