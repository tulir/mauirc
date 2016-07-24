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

"use strict"
function auth() {
  "use strict"
  authfail = false
  var payload = {
    email: $("#email").val(),
    password: $("#password").val()
  }
  $.ajax({
    type: "POST",
    url: "/auth/login",
    data: JSON.stringify(payload),
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      dbg("Successfully authenticated!")
      connect()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 502) {
        $("#error").text("Can't connect to mauIRCd")
      } else if (jqXHR.status === 401) {
        $("#error").text("Invalid username or password")
      }
      $("#error").removeClass("hidden")
      dbg("Authentication failed:", textStatus, errorThrown)
      dbg(jqXHR)
      authfail = true
    }
  })
}

function checkAuth() {
  "use strict"
  authfail = false
  $.ajax({
    type: "GET",
    url: "/auth/check",
    success: function(data) {
      if (data === "true") {
        connect()
      } else {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      dbg("Auth check failed: ", textStatus)
      authfail = true
      $("#container").loadTemplate($("#template-login"), {})
      $("#error").removeClass("hidden")
      $("#error").text("Can't connect to mauIRCd")
      dbg(jqXHR)
    }
  })
}
