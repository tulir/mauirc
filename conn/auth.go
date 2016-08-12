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

// Package conn contains connection code
package conn

import (
	"encoding/json"
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc-common/errors"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util"
	"maunium.net/go/mauirc/util/console"
)

var jq = jquery.NewJQuery

func init() {
	js.Global.Set("auth", map[string]interface{}{
		"check":    CheckAuth,
		"login":    Login,
		"register": Register,
		"forgotPassword": func() {
			jq("#error").SetText("Password reset has not yet been implemented :/")
		},
	})
}

// CheckAuth asks the server if the cookied authentication is valid
func CheckAuth() {
	console.Log("Checking authentication status...")
	jquery.Ajax(map[string]interface{}{
		"type": "GET",
		"url":  "/auth/check",
		jquery.SUCCESS: func(rawdat string) {
			var dat struct {
				Success bool `json:"authenticated"`
			}
			json.Unmarshal([]byte(rawdat), &dat)

			if dat.Success {
				jq("#authsend").AddClass("disabled")
				jq("#authsend").SetText("Connecting...")
				Connect()
			} else {
				data.AuthFail = true
				data.MessageContainerActive = false
				templates.Apply("login", "#container", nil)
				console.Log("Not logged in")
			}
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			console.Error("Auth check failed: HTTP", info["status"])
			console.Error(info)
			data.AuthFail = true
			templates.Apply("login", "#container", nil)
			jq("#error").RemoveClass("hidden")
			jq("#error").SetText("Can't connect to mauIRCd")
		},
	})
}

type loginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login sends a request to /auth/login
func Login() {
	jquery.Ajax(map[string]interface{}{
		"type": "POST",
		"url":  "/auth/login",
		"data": util.MarshalString(loginForm{Email: jq("#email").Val(), Password: jq("#password").Val()}),
		jquery.SUCCESS: func() {
			jq("#auth-login").AddClass("disabled")
			jq("#auth-register").AddClass("disabled")
			jq("#auth-login").SetText("Connecting...")
			console.Log("Successfully authenticated!")
			Connect()
		},
		jquery.ERROR: authFailed,
	})
}

// Register sends a request to /auth/register
func Register() {
	jquery.Ajax(map[string]interface{}{
		"type": "POST",
		"url":  "/auth/register",
		"data": util.MarshalString(loginForm{Email: jq("#email").Val(), Password: jq("#password").Val()}),
		jquery.SUCCESS: func() {
			// TODO register success message
		},
		jquery.ERROR: authFailed,
	})
}

func authFailed(info map[string]interface{}, textStatus, errorThrown string) {
	status, _ := info["status"].(int)
	if status == 502 {
		jq("#error").SetText("Can't connect to mauIRCd")
	} else if status == 500 {
		jq("#error").SetText("Can't connect to mauIRCd:<br>Server isn't feeling well")
	} else {
		var err errors.WebError
		rawData, _ := info["responseText"].(string)
		json.Unmarshal([]byte(rawData), &err)
		jq("#error").SetText(err.Human)
	}
	jq("#error").RemoveClass("hidden")
	console.Error("Register failed:", textStatus, errorThrown)
	console.Error(info)
	data.AuthFail = true
}
