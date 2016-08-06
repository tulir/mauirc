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
	"regexp"
	"strings"
)

// GetActiveChannel gets the name of the active channel
func GetActiveChannel() string {
	active := jq(".channel-switcher.active > .channel-switcher-name")
	if active.Length > 0 {
		return active.Text()
	}
	return ""
}

// GetActiveNetwork gets the name of the active network
func GetActiveNetwork() string {
	active := jq(".network-switcher.activenet > .network-switcher-name")
	if active.Length > 0 {
		return strings.TrimSpace(active.Text())
	}
	return ""
}

// GetActiveChannelObj gets the active channel container
func GetActiveChannelObj() jquery.JQuery {
	return jq(".channel-container:not(.hidden)")
}

// GetActiveNetworkObj gets the active network container
func GetActiveNetworkObj() jquery.JQuery {
	return jq(".network-container:not(.hidden)")
}

// GetChannel returns the container for the channel with the given name
func GetChannel(network, channel string) jquery.JQuery {
	return jq(fmt.Sprintf("#chan-%s-%s", NetworkFilter(network), ChannelFilter(channel)))
}

// GetNetwork returns the container for the network with the given name
func GetNetwork(network string) jquery.JQuery {
	return jq(fmt.Sprintf("#net-%s", NetworkFilter(network)))
}

var chanfilter = regexp.MustCompile("([\\#\\*\\.])")

// ChannelFilter filters the given channel name into a string usable in jQuery
func ChannelFilter(channel string) string {
	return strings.ToLower(chanfilter.ReplaceAllString(channel, "\\$1"))
}

// NetworkFilter filters the given network name into a string usable in jQuery
func NetworkFilter(network string) string {
	return strings.ToLower(network)
}

// OpenChannelAdder opens the channel adder for the given network
func OpenChannelAdder(network string) {
	network = NetworkFilter(network)

	var oldAdder = jq(fmt.Sprintf("#channel-adder-%s", network))
	if oldAdder.Length != 0 {
		oldAdder.Focus()
		return
	}

	templates.Append("channel-adder", fmt.Sprintf("#chanswitchers-%s", network), map[string]interface{}{
		"ID":     fmt.Sprintf("channel-adder-%s", network),
		"WrapID": fmt.Sprintf("channel-adder-wrapper-%s", network),
		"Finish": fmt.Sprintf("if (event.keyCode === 13) { ui.finishChannelAdding('%[1]s') } else if (event.keyCode === 27) { ui.cancelChannelAdding('%[1]s') }", network),
		"Blur":   fmt.Sprintf("ui.cancelChannelAdding('%s')", network),
	})

	adder := jq(fmt.Sprintf("#channel-adder-%s", network))
	adder.Focus()
	/* TODO: Autocomplete? Original JS implementation:
	   adder.easyAutocomplete({
	     data: data.getNetwork(network).getChannels(),
	     placeholder: "Nick or #channel",
	     list: {
	       maxNumberOfElements: 10,
	       match: { enabled: true },
	       sort: {enabled: true },
	       onChooseEvent: function() { finishNewChannel(network) },
	       showAnimation: {
	         type: "slide",
	         time: 400,
	         callback: function() {}
	       },
	       hideAnimation: {
	         type: "slide",
	         time: 400,
	         callback: function() {}
	       }
	     }
	   })
	*/
}

// CancelChannelAdding closes the channel adder
func CancelChannelAdding(network string) {
	jq(fmt.Sprintf("#channel-adder-wrapper-%s", network)).Remove()
	jq(fmt.Sprintf("#add-channel-%s", network)).RemoveClass("hidden")
}

// FinishChannelAdding finishes adding a channel
func FinishChannelAdding(network string) {
	adder := jq(fmt.Sprintf("#channel-adder-%s", network))
	if adder.Length == 0 {
		return
	}

	name := strings.TrimSpace(adder.Val())
	jq(fmt.Sprintf("#channel-adder-wrapper-%s", network)).Remove()
	if len(name) == 0 {
		return
	}

	if name[0] == '#' {
		/* TODO how to send messages?
		  data.Messages <- messages.Container{
			  Type: messages.MsgMessage,
			  Object: messages.Message{
				  Network: network,
				  Channel: name,
				  Command: "join",
				  Message: "Joining",
			  },
		  }
		*/
	}

	jq(fmt.Sprintf("#add-channel-%s", network)).RemoveClass("hidden")
	OpenChannel(network, name, true)
	SwitchTo(network, name)
}

// OpenNetwork opens a network
func OpenNetwork(network string) {
	network = NetworkFilter(network)

	if jq(fmt.Sprintf("#net-%s", network)).Length != 0 {
		return
	}

	templates.Append("network", "#messages", network)
	templates.Append("network-switcher", "#networks", network)
	// CreateRawIO(network)
}

// OpenChannel opens a channel
func OpenChannel(network, channel string, byUser bool) {
	network = NetworkFilter(network)
	chanLower := strings.ToLower(channel)

	netObj := GetNetwork(network)
	if netObj.Length == 0 {
		OpenNetwork(network)
		netObj = GetNetwork(network)
	}

	if GetChannel(network, channel).Length != 0 {
		return
	}

	if byUser {
		/* TODO send messages?
		data.Messages <- messages.Container{
			Type: messages.MsgOpen,
			Object: messages.Open{
				Network: network,
				Channel: channel,
			},
		}
		*/
	}

	templates.AppendObj("channel", netObj, fmt.Sprintf("chan-%s-%s", network, chanLower))
	templates.Append("channel-switcher", fmt.Sprintf("#chanswitchers-%s", network), map[string]interface{}{
		"Channel":     chanLower,
		"ChannelReal": channel,
		"Network":     network,
	})
}

// CloseChannel closes a channel
func CloseChannel(network, channel string) {
	network = NetworkFilter(network)
	chanFiltered := ChannelFilter(channel)

	netObj := GetNetwork(network)
	if netObj.Length == 0 {
		return
	}

	chanObj := GetChannel(network, channel)
	if chanObj.Length == 0 {
		return
	}

	if GetActiveNetwork() == network && GetActiveChannel() == channel {
		SwitchToClear()
	}
	chanObj.Remove()
	jq(fmt.Sprintf("#switchto-%s-%s", network, chanFiltered)).Remove()
	jq(fmt.Sprintf("#break-chan-%s-%s", network, chanFiltered)).Remove()
}

// SwitchToClear switches to a empty message view
func SwitchToClear() {
	GetActiveChannelObj().AddClass("hidden")
	GetActiveNetworkObj().AddClass("hidden")
	jq(".channel-switcher.active").RemoveClass("active")
	jq(".network-switcher.activenet").RemoveClass("activenet")
	jq("#title").SetText("")
	OpenMessageView()
}

// SwitchTo switches to the given channel on the given network
func SwitchTo(network, channel string) {
	network = NetworkFilter(network)
	fmt.Printf("Switching to channel %s @ %s\n", channel, network)

	SwitchToClear()
	jq("#message-text").Focus()

	var title string
	chanData := data.Networks.MustGetChannel(network, channel)
	if len(chanData.Topic) != 0 {
		title = chanData.Topic
	} else {
		title = channel
	}
	jq("#title").SetText(title)

	chanObj := GetChannel(network, channel)
	if chanData.HistoryFetched && chanObj.Find(".invite-wrapper").Length == 0 {
		// TODO fetch history
		// history(network, channel, 512)
	}

	jq("#switchnet-%s", network).AddClass("activenet")
	jq("#net-%s", network).RemoveClass("hidden")
	chanObj.RemoveClass("hidden")
	chanSwitcher := jq(fmt.Sprintf("#switchto-%s-%s", network, ChannelFilter(channel)))
	chanSwitcher.RemoveClass("new-messages")
	chanSwitcher.AddClass("active")
	UpdateUserlist()
	ScrollDown()
}

// OpenPM opens a private query with the given user on the given network
func OpenPM(network, user string) {
	OpenChannel(network, user, true)
	SwitchTo(network, user)
}

// OpenMessageView switches to the message view
func OpenMessageView() {
	jq("#networks").AddClass("hidden-medium-down")
	jq("#messaging").RemoveClass("hidden-medium-down")
	jq("#userlist").AddClass("hidden-medium-down")
}

// OpenNetworksView switches to the network list view
func OpenNetworksView() {
	jq("#networks").RemoveClass("hidden-medium-down")
	jq("#messaging").AddClass("hidden-medium-down")
	jq("#userlist").AddClass("hidden-medium-down")
}

// OpenUserlistView switches to the userlist view
func OpenUserlistView() {
	jq("#networks").AddClass("hidden-medium-down")
	jq("#messaging").AddClass("hidden-medium-down")
	jq("#userlist").RemoveClass("hidden-medium-down")
}

// ToggleNetworksView toggles between the network and message view
func ToggleNetworksView() {
	if jq("#networks").HasClass("hidden-medium-down") {
		OpenNetworksView()
	} else {
		OpenMessageView()
	}
}

// ToggleUserlistView toggles between the userlist and message view
func ToggleUserlistView() {
	if jq("#userlist").HasClass("hidden-medium-down") {
		OpenUserlistView()
	} else {
		OpenMessageView()
	}
}
