function getActiveChannel() {
  var active = $(".channel-switcher.active")
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
  return $(".channel-container:visible")
}

function getActiveNetworkObj(){
  return $(".network-container:visible")
}

function switchView() {
  if ($("#networks").hasClass("hidden-tablet-down")) {
    $("#messages").addClass("hidden-tablet-down")
    $("#networks").removeClass("hidden-tablet-down")
  } else {
    $("#messages").removeClass("hidden-tablet-down")
    $("#networks").addClass("hidden-tablet-down")
  }
}

function switchTo(network, channel) {
  network = network.toLowerCase()
  console.log("Switching to channel " + channel + " @ " + network)
  getActiveChannelObj().attr("hidden", true)
  getActiveNetworkObj().attr("hidden", true)
  $(".channel-switcher.active").removeClass("active")
  $(".network-switcher.activenet").removeClass("activenet")
  $("#message-text").focus()

  if (channel == "MauIRC Status") {
    $("#status-messages").removeAttr("hidden")
    $("#status-enter").addClass("active")
    $("#status-enter").removeClass("new-messages")
    scrollDown()
    return
  }

  $("#net-" + network).removeAttr("hidden")
  $("#switchnet-" + network).addClass("activenet")
  $("#chan-" + channelFilter(channel)).removeAttr("hidden")

  var newChanSwitcher = $("#switchto-" + channelFilter(channel))
  newChanSwitcher.removeClass("new-messages")
  newChanSwitcher.addClass("active")

  scrollDown()
}

function channelFilter(channel) {
  return channel.replace("#", "\\#").toLowerCase()
}
