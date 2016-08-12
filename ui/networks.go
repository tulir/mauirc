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
	"fmt"
	"github.com/gopherjs/jquery"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util"
	"maunium.net/go/mauirc/util/console"
	"strconv"
)

// OpenNetworkEditor opens the network editor
func OpenNetworkEditor() {
	jq("#settings-main").AddClass("hidden")
	jq("#settings-scripts").AddClass("hidden")
	jq("#settings-networks").RemoveClass("hidden")

	for name := range data.Networks {
		addNetworkToList(name)
	}
}

func addNetworkToList(net string) {
	console.Log(net)
	templates.Append("settings-list-entry", "#network-list", map[string]interface{}{
		"Type": "network",
		"Name": net,
	})
	console.Log(jq(fmt.Sprintf("#chnetwork-%s", net)))
}

// CloseNetworkEditor closes the network editor
func CloseNetworkEditor() {
	jq("#settings-main").RemoveClass("hidden")
	jq("#settings-networks").AddClass("hidden")
	jq("#network-tool-save").Call("unbind", "click")
	jq("#network-tool-delete").Call("unbind", "click")
}

// SwitchNetwork switches the network being edited
func SwitchNetwork(net string) {
	if jq(fmt.Sprintf("#chnetwork-%s", net)).HasClass("new-net") {
		jq("#network-list .new-net").Remove()
	}

	jq("#network-tool-save").Call("unbind", "click")
	jq("#network-tool-save").Call("click", func() {
		SaveNetwork(net)
	})

	jq("#network-tool-delete").Call("unbind", "click")
	jq("#network-tool-delete").Call("click", func() {
		DeleteNetwork(net)
	})

	jq("#network-pane").SetAttr("data-network", net)

	jq(".network-list .selected-network").RemoveClass("selected-network")
	jq(fmt.Sprintf("#chnetwork-%s", net)).AddClass("selected-network")

	netData := data.MustGetNetwork(net)
	jq("#network-ed-name").SetVal(net)
	jq("#network-ed-addr").SetVal(netData.IP)
	jq("#network-ed-port").SetVal(netData.Port)
	jq("#network-ed-ssl").SetAttr("active", netData.SSL)
	jq("#network-ed-connected").SetAttr("active", netData.Connected)
	jq("#network-ed-user").SetVal(netData.User)
	jq("#network-ed-realname").SetVal(netData.Realname)
	jq("#network-ed-nick").SetVal(netData.Nick)
}

// StartNewNetwork opens the network adder
func StartNewNetwork() {
	templates.Append("settings-object-adder", "#network-list", "network")
	jq("#network-adder").Focus()
}

// CancelNewNetwork cancels adding a new network
func CancelNewNetwork() {
	jq("#network-adder-wrapper").Remove()
}

// FinishNewNetwork ...
func FinishNewNetwork() {
	name := jq("#network-adder").Val()
	CancelNewNetwork()
	addNetworkToList(name)
	SwitchNetwork(name)
}

// DeleteNetwork deletes a network
func DeleteNetwork(net string) {
	jquery.Ajax(map[string]interface{}{
		"type": "DELETE",
		"url":  fmt.Sprintf("/network/%s/", net),
		jquery.SUCCESS: func() {
			console.Log("Successfully deleted network", net)
		},
		jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
			console.Error("Failed to delete network %s: HTTP %s", net, info["status"])
			console.Error(info)
		},
	})
}

type networkRequest struct {
	Name            string `json:"name,omitempty"`
	User            string `json:"user,omitempty"`
	Realname        string `json:"realname,omitempty"`
	Nick            string `json:"nick,omitempty"`
	Connected       string `json:"connected,omitempty"`
	SSL             string `json:"ssl,omitempty"`
	SSLBool         bool   `json:"ssl,omitempty"`
	IP              string `json:"ip,omitempty"`
	Port            uint16 `json:"port,omitempty"`
	ForceDisconnect bool   `json:"forcedisconnect,omitempty"`
}

// SaveNetwork saves a network
func SaveNetwork(net string) {
	if net == "newnet" {
		net = jq("#network-ed-name").Val()
		if net == "newnet" {
			return
		}
		chnet := jq(fmt.Sprintf("#chnetwork-newnet"))
		chnet.SetAttr("id", net)
		chnet.SetText(net)
		chnet = jq(fmt.Sprintf("#chnetwork-%s", net))

		port, _ := strconv.ParseUint(jq("#network-ed-port").Val(), 10, 16)
		console.Log(util.MarshalString(networkRequest{
			IP:       jq("#network-ed-addr").Val(),
			Port:     uint16(port),
			SSL:      jq("#network-ed-ssl").Attr("active"),
			User:     jq("#network-ed-user").Val(),
			Realname: jq("#network-ed-realname").Val(),
			Nick:     jq("#network-ed-nick").Val(),
		}))
		jquery.Ajax(map[string]interface{}{
			"type": "PUT",
			"url":  fmt.Sprintf("/network/%s/", net),
			"data": util.MarshalString(networkRequest{
				IP:       jq("#network-ed-addr").Val(),
				Port:     uint16(port),
				SSLBool:  jq("#network-ed-ssl").Attr("active") == "true",
				User:     jq("#network-ed-user").Val(),
				Realname: jq("#network-ed-realname").Val(),
				Nick:     jq("#network-ed-nick").Val(),
			}),
			jquery.SUCCESS: func() {
				console.Log("Successfully created network", net)
				jquery.Ajax(map[string]interface{}{
					"type": "POST",
					"url":  fmt.Sprintf("/network/%s/", net),
					"data": util.MarshalString(networkRequest{
						Connected: jq("#network-ed-connected").Attr("active"),
					}),
				})
			},
			jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
				console.Error("Failed to create network %s: HTTP %s", net, info["status"])
				console.Error(info)
			},
		})
	} else {
		port, _ := strconv.ParseUint(jq("#network-ed-port").Val(), 10, 16)
		jquery.Ajax(map[string]interface{}{
			"type": "POST",
			"url":  fmt.Sprintf("/network/%s/", net),
			"data": util.MarshalString(networkRequest{
				IP:              jq("#network-ed-addr").Val(),
				Port:            uint16(port),
				SSL:             jq("#network-ed-ssl").Attr("active"),
				User:            jq("#network-ed-user").Val(),
				Realname:        jq("#network-ed-realname").Val(),
				Nick:            jq("#network-ed-nick").Val(),
				Connected:       jq("#network-ed-connected").Attr("active"),
				ForceDisconnect: false,
			}),
			jquery.SUCCESS: func(data string) {
				console.Log("Successfully updated network", net)
				console.Log(data)
			},
			jquery.ERROR: func(info map[string]interface{}, textStatus, errorThrown string) {
				console.Error("Failed to update network %s: HTTP %s", net, info["status"])
				console.Error(info)
			},
		})
	}
}
