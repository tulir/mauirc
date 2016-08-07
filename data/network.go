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
	"maunium.net/go/mauirc-common/messages"
	"strings"
)

// Network contains network data
type Network struct {
	Channels     ChannelList
	ChannelNames []string
	Highlights   HighlightList
	Scripts      ScriptStore
	Nick         string
	User         string
	Realname     string
	IP           string
	Port         int
	SSL          bool
	Connected    bool
}

// CreateNetwork creates a network
func CreateNetwork() *Network {
	return &Network{
		Channels:     make(ChannelList),
		Highlights:   make(HighlightList, 0),
		Scripts:      make(ScriptStore),
		ChannelNames: make([]string, 0),
	}
}

// SetNetData ...
func (net *Network) SetNetData(nd messages.NetData) {
	// TODO implement setting nick, user, realname, ip, port, ssl and connected from struct
}

// ChannelList is a list of channels
type ChannelList map[string]*Channel

// MustGet gets or creates the channel with the given name
func (cl ChannelList) MustGet(name string) *Channel {
	ch, ok := cl[name]
	if !ok {
		ch = CreateChannel()
		cl[name] = ch
	}
	return ch
}

// Get the channel with the given name if it exists
func (cl ChannelList) Get(name string) *Channel {
	ch, ok := cl[name]
	if !ok {
		return nil
	}
	return ch
}

// Exists checks if the channel with the given name exists
func (cl ChannelList) Exists(name string) bool {
	_, ok := cl[name]
	return ok
}

// HighlightList is a list of highlights
type HighlightList []Highlight

func (hll HighlightList) String() string {
	var str string
	for _, hl := range hll {
		str += strings.Replace(hl.String(), ",", "\\,", -1) + ","
	}
	return str[:len(str)-1]
}

// Parse highlights from a string
func (hll HighlightList) Parse(parse string) {
	list := []string{parse}
	var minIndex int
	for {
		current := len(list) - 1
		str := list[current]
		index := strings.IndexRune(str[minIndex:], ',')

		if index == -1 {
			break
		} else if index == 0 {
			list[current] = str[1:]
			minIndex = 1
			continue
		}

		if str[index-1] == '\\' {
			minIndex = index
			list[current] = str[0:index-1] + str[index:]
			continue
		} else if index == len(str)-1 {
			list[current] = str[0 : index-1]
			break
		}

		list[current] = str[0:index]
		list = append(list, str[index+1:])
		minIndex = 0
	}

	hll = make([]Highlight, len(list))
	for i, str := range list {
		if str[0] == ':' {
			hll[i] = CreateRegexHighlight(str[1:])
		} else {
			hll[i] = CreateStringHighlight(str)
		}
	}
}
