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
	//OpenChannel(network, name, true)
	//SwitchTo(network, name)
}

/* TODO implement the following
function openPM(network, user) {
  "use strict"
  openChannel(network, user, true)
  switchTo(network, user)
}

function openNetwork(network) {
  "use strict"
  network = network.toLowerCase()
  if ($(sprintf("#net-%s", network)).length !== 0) {
    return
  }

  $("#messages").loadTemplate($("#template-network"), {
    network: sprintf("net-%s", network)
  }, {append: true, isFile: false, async: false})
  $("#networks").loadTemplate($("#template-network-switcher"), {
    network: sprintf("switchnet-%s", network),
    networkname: network,
    openchannel: sprintf("newChannel('%s')", network),
    networkbtns: sprintf("chanswitchers-%s", network),
    addchanid: sprintf("add-channel-%s", network)
  }, {append: true, isFile: false, async: false})
  createRawIO(network)
}

function openChannel(network, channel, byUser) {
  "use strict"
  network = network.toLowerCase()
  var chanLower = channel.toLowerCase()
  var netObj = $(sprintf("#net-%s", network))
  if (netObj.length === 0) {
    openNetwork(network)
    netObj = $(sprintf("#net-%s", network))
  }

  if (getChannel(network, channel).length !== 0) {
    return
  }

  if (byUser) {
    sendMessage({
      type: "open",
      network: network,
      channel: channel
    })
  }

  netObj.loadTemplate($("#template-channel"), {
    channel: sprintf("chan-%s-%s", network, chanLower)
  }, {append: true, isFile: false, async: false})
  $(sprintf("#chanswitchers-%s", network)).loadTemplate($("#template-channel-switcher"), {
    channel: sprintf("switchto-%s-%s", network, chanLower),
    brid: sprintf("break-chan-%s-%s", network, chanLower),
    channelname: channel,
    onclick: sprintf("switchTo('%s', '%s')", network, chanLower)
  }, {append: true, isFile: false, async: false})
}

function closeChannel(network, channel) {
  "use strict"
  network = network.toLowerCase()
  var netObj = $(sprintf("#net-%s", network))
  if (netObj.length === 0) {
    return
  }

  var chanObj = getChannel(network, channel)
  if (chanObj.length === 0) {
    return
  }

  if (getActiveNetwork() === network && getActiveChannel() == channel) {
    switchToClear()
  }
  chanObj.remove()
  $(sprintf("#switchto-%s-%s", network, channelFilter(channel))).remove()
  $(sprintf("#break-chan-%s-%s", network, channelFilter(channel))).remove()
}

function switchView(userlist) {
  "use strict"
  if ($("#messaging").hasClass("hidden-medium-down")) {
    if ($("#userlist").hasClass("hidden-medium-down")) {
      $("#networks").addClass("hidden-medium-down")
    } else {
      $("#userlist").addClass("hidden-medium-down")
    }
    $("#messaging").removeClass("hidden-medium-down")
  } else {
    if (userlist) {
      $("#userlist").removeClass("hidden-medium-down")
      $("#messaging").addClass("hidden-medium-down")
    } else {
      $("#networks").removeClass("hidden-medium-down")
      $("#messaging").addClass("hidden-medium-down")
    }
  }
}

function switchToClear() {
  "use strict"
  getActiveChannelObj().addClass("hidden")
  getActiveNetworkObj().addClass("hidden")
  $(".channel-switcher.active").removeClass("active")
  $(".network-switcher.activenet").removeClass("activenet")
  $("#title").text("")
  if ($("#messaging").hasClass("hidden-medium-down")) {
    switchView(false)
  }
}

function switchTo(network, channel) {
  "use strict"
  network = network.toLowerCase()
  dbg(sprintf("Switching to channel %s @ %s", channel, network))
  getActiveChannelObj().addClass("hidden")
  getActiveNetworkObj().addClass("hidden")
  $(".channel-switcher.active").removeClass("active")
  $(".network-switcher.activenet").removeClass("activenet")
  $("#message-text").focus()

  var channelData = data.getChannel(network, channel)
  if (channelData.getTopic().length !== 0) {
    var title = channelData.getTopic()
  } else {
    var title = channel
  }
  $("#title").text(title)

  if ($("#messaging").hasClass("hidden-medium-down")) {
    switchView(false)
  }
  var chanObj = getChannel(network, channel)

  if (!channelData.isHistoryFetched() && chanObj.find(".invite-wrapper").length == 0) {
    history(network, channel, 512)
  }

  $(sprintf("#switchnet-%s", network)).addClass("activenet")
  $(sprintf("#net-%s", network)).removeClass("hidden")
  chanObj.removeClass("hidden")

  var newChanSwitcher = $(sprintf("#switchto-%s-%s", network, channelFilter(channel)))
  newChanSwitcher.removeClass("new-messages")
  newChanSwitcher.addClass("active")

  updateUserList()
  scrollDown()
}
*/
