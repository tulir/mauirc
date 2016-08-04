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

// Package auth contains authentication code
package auth

import (
	"encoding/json"
	"fmt"
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util"
)

var jq = jquery.NewJQuery

func init() {
	js.Global.Set("auth", map[string]interface{}{
		"check":    Check,
		"login":    Login,
		"register": Register,
	})
}

// Check asks the server if the cookied authentication is valid
func Check() {
	fmt.Println("Checking authentication status...")
	jquery.Ajax(map[string]interface{}{
		"type": "GET",
		"url":  "/auth/check",
		jquery.SUCCESS: func(data string) {
			if data == "true" {
				jq("#authsend").AddClass("disabled")
				jq("#authsend").SetText("Connecting...")
				//connect()
			} else {
				//authfail = true
				//msgcontainer = false
				templates.Apply("login", "#container", "")
				fmt.Println("Not logged in")
			}
		},
		jquery.ERROR: func(data map[string]interface{}, textStatus, errorThrown string) {
			fmt.Println("Auth check failed: ", textStatus)
			//authfail = true
			templates.Apply("login", "#container", "")
			jq("#error").RemoveClass("hidden")
			jq("#error").SetText("Can't connect to mauIRCd")
			fmt.Println(data)
		},
	})
}

type loginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login sends a request to /auth/login
func Login() {
	payload, _ := json.Marshal(&loginForm{Email: jq("#email").Val(), Password: jq("#password").Val()})

	jquery.Ajax(map[string]interface{}{
		"type": "POST",
		"url":  "/auth/login",
		"data": payload,
		"success": func() {
			jq("#auth-login").AddClass("disabled")
			jq("#auth-register").AddClass("disabled")
			jq("#auth-login").SetText("Connecting...")
			fmt.Println("Successfully authenticated!")
			//connect()
		},
		"error": func(data map[string]interface{}, textStatus, errorThrown string) {
			status, _ := data["status"].(int)
			if status == 502 {
				jq("#error").SetText("Can't connect to mauIRCd")
			} else if status == 500 {
				jq("#error").SetText("Can't connect to mauIRCd:<br>Server isn't feeling well")
			} else {
				var err util.WebError
				rawData, _ := data["responseText"].(string)
				json.Unmarshal([]byte(rawData), &err)
				jq("#error").SetText(err.Human)
			}
			jq("#error").RemoveClass("hidden")
			fmt.Println("Authentication failed:", textStatus, errorThrown)
			fmt.Println(data)
			//authfail = true
		},
	})
}

// Register sends a request to /auth/register
func Register() {

}
