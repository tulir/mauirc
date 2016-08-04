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

// Base store variables
var (
	Networks          = make(NetworkList)
	GlobalScripts     = make(ScriptStore)
	MessageFormatting = true
)

// Misc variables
var (
	AuthFail               = false
	Connected              = false
	MessageContainerActive = false
)

// NetworkList is a list of networks
type NetworkList map[string]*Network

// MustGet gets or creates the network with the given name
func (nl NetworkList) MustGet(name string) *Network {
	net, ok := nl[name]
	if !ok {
		net = CreateNetwork()
		nl[name] = net
	}
	return net
}

// Get the network with the given name if it exists
func (nl NetworkList) Get(name string) *Network {
	net, ok := nl[name]
	if !ok {
		return nil
	}
	return net
}

// Exists checks if the network with the given name exists
func (nl NetworkList) Exists(name string) bool {
	_, ok := nl[name]
	return ok
}

// MustGetChannel gets or creates the channel with the given name in the network with the given name
func (nl NetworkList) MustGetChannel(network, channel string) *Channel {
	return nl.MustGet(network).Channels.MustGet(channel)
}

// GetChannel gets the channel with the given name in the network with the given name if they both exist
func (nl NetworkList) GetChannel(network, channel string) *Channel {
	net := nl.Get(network)
	if net != nil {
		return net.Channels.Get(channel)
	}
	return nil
}

// ChannelExists checks if a channel with the given name exists in the network with the given name
func (nl NetworkList) ChannelExists(network, channel string) bool {
	net := nl.Get(network)
	if net != nil {
		return net.Channels.Exists(channel)
	}
	return false
}
