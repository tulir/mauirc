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

// Package data contains the session data storage system
package data

import (
	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/websocket"
	"maunium.net/go/mauirc-common/messages"
)

// Base store variables
var (
	Networks          = make(map[string]*Network)
	GlobalScripts     = make(ScriptStore)
	MessageFormatting = true
)

// Misc variables
var (
	AuthFail               = false
	Connected              = false
	MessageContainerActive = false
)

// Connection variables
var (
	Socket     *websocket.WebSocket
	SocketPath string
	Messages   = make(chan messages.Container, 16)
)

func init() {
	SocketPath = "wss://" + js.Global.Get("window").Get("location").Get("host").String() + "/socket"
	if js.Global.Get("window").Get("location").Get("protocol").String() != "https:" {
		SocketPath = "w" + SocketPath[2:]
	}
}

// MustGetNetwork gets or creates the network with the given name
func MustGetNetwork(name string) *Network {
	net, ok := Networks[name]
	if !ok {
		net = CreateNetwork()
		Networks[name] = net
	}
	return net
}

// GetNetwork the network with the given name if it exists
func GetNetwork(name string) *Network {
	net, ok := Networks[name]
	if !ok {
		return nil
	}
	return net
}

// NetworkExists checks if the network with the given name exists
func NetworkExists(name string) bool {
	_, ok := Networks[name]
	return ok
}

// MustGetChannel gets or creates the channel with the given name in the network with the given name
func MustGetChannel(network, channel string) *Channel {
	return MustGetNetwork(network).MustGetChannel(channel)
}

// GetChannel gets the channel with the given name in the network with the given name if they both exist
func GetChannel(network, channel string) *Channel {
	net := GetNetwork(network)
	if net != nil {
		return net.GetChannel(channel)
	}
	return nil
}

// ChannelExists checks if a channel with the given name exists in the network with the given name
func ChannelExists(network, channel string) bool {
	net := GetNetwork(network)
	if net != nil {
		return net.ChannelExists(channel)
	}
	return false
}
