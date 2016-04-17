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

function getActiveChannel() {
  var active = $(".channel-switcher.active > .channel-switcher-name")
  if (active.length) {
    return active.text()
  }
  return ""
}

function getActiveNetwork() {
  if (getActiveChannel() === "mauIRC Status") return "mauIRC Status"
  var active = $(".network-switcher.activenet > .network-switcher-name")
  if (active.length) {
    return active.text().trim()
  }
  return ""
}

function getActiveChannelObj() {
  return $(".channel-container:not(.hidden)")
}

function getActiveNetworkObj(){
  return $(".network-container:not(.hidden)")
}

function openPM(network, user) {
  openChannel(network, user)
  switchTo(network, user)
}

function newChannel(network) {
  network = network.toLowerCase()

  var oldAdder = $(sprintf("#channel-adder-%s", network))
  if (oldAdder.length !== 0) {
    oldAdder.focus()
    return
  }

  $(sprintf("#chanswitchers-%s", network)).loadTemplate($("#template-channel-adder"), {
    id: sprintf("channel-adder-%s", network),
    wrapid: sprintf("channel-adder-wrapper-%s", network),
    finish: sprintf("if (event.keyCode === 13) { finishNewChannel('%1$s') } else if (event.keyCode === 27) { cancelNewChannel('%1$s') }", network),
    blur: sprintf("cancelNewChannel('%s')", network)
  }, {append: true, isFile: false, async: false})
  $(sprintf("#add-channel-%s", network)).addClass("hidden")
  var adder = $(sprintf("#channel-adder-%s", network))
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
  });
  adder.focus()
}

function cancelNewChannel(network) {
  $(sprintf("#channel-adder-wrapper-%s", network)).remove()
  $(sprintf("#add-channel-%s", network)).removeClass("hidden")
}

function finishNewChannel(network) {
  var adder = $(sprintf("#channel-adder-%s", network))
  if (adder.length === 0) {
    return
  }

  var name = adder.val().trim()
  $(sprintf("#channel-adder-wrapper-%s", network)).remove()

  if (name.length === 0) {
    return
  }

  if (name.startsWith("#")) {
    sendMessage({
      type: "message",
      network: network,
      channel: name,
      command: "join",
      message: "Joining"
    })
  }

  $(sprintf("#add-channel-%s", network)).removeClass("hidden")
  openChannel(network, name)
  switchTo(network, name)
}

function openNetwork(network) {
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
}

function openChannel(network, channel) {
  network = network.toLowerCase()
  chanLower = channel.toLowerCase()
  var netObj = $(sprintf("#net-%s", network))
  if (netObj.length === 0) {
    openNetwork(network)
    netObj = $(sprintf("#net-%s", network))
  }

  if ($(sprintf("#chan-%s-%s", network, channelFilter(channel))).length !== 0) {
    return
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
  network = network.toLowerCase()
  var netObj = $(sprintf("#net-%s", network))
  if (netObj.length === 0) {
    return
  }

  var chanObj = $(sprintf("#chan-%s-%s", network, channelFilter(channel)))
  if (chanObj.length === 0) {
    return
  }

  if (getActiveNetwork() === network && getActiveChannel() == channel) {
    switchTo("mauIRC Status", "mauIRC Status")
  }
  chanObj.remove()
  $(sprintf("#switchto-%s-%s", network, channelFilter(channel))).remove()
  $(sprintf("#break-chan-%s-%s", network, channelFilter(channel))).remove()
}

function switchView(userlist) {
  if ($("#messaging").hasClass("hidden-tablet-down")) {
    if ($("#userlist").hasClass("hidden-tablet-down")) {
      $("#networks").addClass("hidden-tablet-down")
    } else {
      $("#userlist").addClass("hidden-tablet-down")
    }
    $("#messaging").removeClass("hidden-tablet-down")
  } else {
    if (userlist) {
      $("#userlist").removeClass("hidden-tablet-down")
      $("#messaging").addClass("hidden-tablet-down")
    } else {
      $("#networks").removeClass("hidden-tablet-down")
      $("#messaging").addClass("hidden-tablet-down")
    }
  }
}

function switchTo(network, channel) {
  network = network.toLowerCase()
  chanFiltered = channelFilter(channel)
  console.log(sprintf("Switching to channel %s @ %s", channel, network))
  getActiveChannelObj().addClass("hidden")
  getActiveNetworkObj().addClass("hidden")
  $(".channel-switcher.active").removeClass("active")
  $(".network-switcher.activenet").removeClass("activenet")
  $("#message-text").focus()

  var channelData = data.getChannelIfExists(network, channel)
  var title = channel
  if (channelData !== undefined) {
    title = channelData.getTopic()
    if (title.length === 0) {
      title = channel
    }
  }
  $("#title").text(title)

  if ($("#messaging").hasClass("hidden-tablet-down")) {
    switchView(false)
  }

  if (channel === "mauIRC Status") {
    $("#status-messages").removeClass("hidden")
    $("#status-enter").addClass("active")
    $("#status-enter").removeClass("new-messages")
    updateUserList()
    scrollDown()
    return
  }

  if (channelData !== undefined && !channelData.isHistoryFetched()) {
    history(network, channel, 512)
  }

  $(sprintf("#switchnet-%s", network)).addClass("activenet")
  $(sprintf("#net-%s", network)).removeClass("hidden")
  $(sprintf("#chan-%s-%s", network, chanFiltered)).removeClass("hidden")

  var newChanSwitcher = $(sprintf("#switchto-%s-%s", network, chanFiltered))
  newChanSwitcher.removeClass("new-messages")
  newChanSwitcher.addClass("active")

  updateUserList()
  scrollDown()
}
