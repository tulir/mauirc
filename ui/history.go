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

// Package ui contains UI-related functions
package ui

import (
	"encoding/json"
	"fmt"
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util/console"
)

// GetHistory gets n messages of the history of channel @ network
func GetHistory(network, channel string, n int) {
	data.MustGetChannel(network, channel).FetchingHistory = true
	GetChannel(network, channel).SetHtml("<div class='loader-center-wrapper'><div class='loader'/></div>")
	jquery.Ajax(map[string]interface{}{
		"type": "GET",
		"url":  fmt.Sprintf("/history/%s/%s/?n=%d", network, js.Global.Call("encodeURIComponent", channel).String(), n),
		jquery.SUCCESS: func(rawData string) {
			GetChannel(network, channel).Empty()

			var histData = make([]messages.Message, 0)
			json.Unmarshal([]byte(rawData), &histData)

			for i := len(histData) - 1; i >= 0; i-- {
				go Receive(histData[i], false)
			}

			chanData := data.MustGetChannel(network, channel)
		Loop:
			for {
				select {
				case obj := <-chanData.MessageCache:
					go Receive(obj, true)
				default:
					break Loop
				}
			}
			chanData.FetchingHistory = false
			chanData.HistoryFetched = true
			ScrollDown()
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			console.Error("Failed to fetch history: HTTP", info["status"])
			console.Error(info)
			data.MustGetChannel(network, channel).FetchingHistory = false
			if len(GetActiveNetwork()) == 0 || len(GetActiveChannel()) == 0 {
				return
			}

			templates.AppendObj("error", GetActiveChannelObj(), fmt.Sprintln("Failed to fetch history:", textStatus, errorThrown))
			ScrollDown()
		},
	})
}
