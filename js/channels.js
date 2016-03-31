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

function newChannel(network) {
  network = network.toLowerCase()

  var oldAdder = $("#channel-adder-" + network)
  if (oldAdder.length !== 0) {
    oldAdder.focus()
    return
  }

  $("#chanswitchers-" + network).loadTemplate($("#template-channel-adder"), {
    id: "channel-adder-" + network,
    wrapid: "channel-adder-wrapper-" + network,
    finish: "if (event.keyCode === 13) { finishNewChannel('" + network + "') }"
  }, {append: true, isFile: false, async: false})
  var adder = $("#channel-adder-" + network)
  adder.easyAutocomplete({
    data: channelData[network]["*list"],
  	list: {
  		maxNumberOfElements: 10,
  		match: {
  			enabled: true
  		}
  	}
  });
  adder.focus()
}

function finishNewChannel(network) {
  var adder = $("#channel-adder-" + network)
  if (adder.length === 0) {
    return
  }

  var name = adder.val().trim()
  $("#channel-adder-wrapper-" + network).remove()

  if (name.length === 0) {
    return
  }

  if (name.startsWith("#")) {
    socket.send(JSON.stringify({
      type: "message",
      network: network,
      channel: name,
      command: "join",
      message: "Joining"
    }))
  }

  openChannel(network, name)
  switchTo(network, name)
}

function openNetwork(network) {
  network = network.toLowerCase()
  if ($("#net-" + network).length !== 0) {
    return
  }

  $("#messages").loadTemplate($("#template-network"), {
    network: "net-" + network
  }, {append: true, isFile: false, async: false})
  $("#networks").loadTemplate($("#template-network-switcher"), {
    network: "switchnet-" + network,
    networkname: network,
    openchannel: "newChannel('" + network + "')",
    networkbtns: "chanswitchers-" + network
  }, {append: true, isFile: false, async: false})
}

function openChannel(network, channel) {
  network = network.toLowerCase()
  var netObj = $("#net-" + network)
  if (netObj.length === 0) {
    openNetwork(network)
    netObj = $("#net-" + network)
  }

  if (netObj.find("#chan-" + channelFilter(channel)).length !== 0) {
    return
  }

  netObj.loadTemplate($("#template-channel"), {
    channel: "chan-" + channel.toLowerCase()
  }, {append: true, isFile: false, async: false})
  $("#chanswitchers-" + network).loadTemplate($("#template-channel-switcher"), {
    channel: "switchto-" + channel.toLowerCase(),
    channelname: channel,
    onclick: "switchTo('" + network + "', '" + channel.toLowerCase() + "')"
  }, {append: true, isFile: false, async: false})
}

function switchView() {
  if ($("#networks").hasClass("hidden-tablet-down")) {
    $("#messaging").addClass("hidden-tablet-down")
    $("#networks").removeClass("hidden-tablet-down")
  } else {
    $("#messaging").removeClass("hidden-tablet-down")
    $("#networks").addClass("hidden-tablet-down")
  }
}

function switchTo(network, channel) {
  network = network.toLowerCase()
  console.log("Switching to channel " + channel + " @ " + network)
  getActiveChannelObj().addClass("hidden")
  getActiveNetworkObj().addClass("hidden")
  $(".channel-switcher.active").removeClass("active")
  $(".network-switcher.activenet").removeClass("activenet")
  $("#message-text").focus()

  var title = channel
  if (channelData[network] !== undefined &&
    channelData[network][channel] !== undefined &&
    channelData[network][channel].topic !== undefined &&
    channelData[network][channel].topic.length > 0) {
    title = channelData[network][channel].topic
  }
  $("#title").text(title)

  if ($("#messaging").hasClass("hidden-tablet-down")) {
    switchView()
  }

  if (channel === "MauIRC Status") {
    $("#status-messages").removeClass("hidden")
    $("#status-enter").addClass("active")
    $("#status-enter").removeClass("new-messages")
    updateUserList()
    scrollDown()
    return
  }

  $("#switchnet-" + network).addClass("activenet")
  var netObj = $("#net-" + network)
  var chanObj = netObj.find("#chan-" + channelFilter(channel))
  netObj.removeClass("hidden")
  chanObj.removeClass("hidden")

  var newChanSwitcher = $("#switchto-" + channelFilter(channel))
  newChanSwitcher.removeClass("new-messages")
  newChanSwitcher.addClass("active")

  updateUserList()
  scrollDown()
}

function channelFilter(channel) {
  return channel.replaceAll("#", "\\#").replaceAll("*", "\\*").replaceAll(".", "\\.").toLowerCase()
}
