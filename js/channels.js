function getActiveChannel(){
  var active = $(".channel-selector.active")
  if (active.length) {
    var id = active.text()
    if (id == "MauIRC Status") return "*mauirc"
    else return id
  }
  return ""
}

function getActiveChannelObj(){
  return $(".channel-messages:visible")
}

function switchTo(channel) {
  console.log("Switching to channel " + channel)
  getActiveChannelObj().attr("hidden", true)
  $(".channel-switcher.active").removeClass("active")
  $("#message-text").focus()

  if (channel == "*mauirc") {
    $("#status-messages").removeAttr("hidden")
    $("#status-enter").addClass("active")
    $("#status-enter").removeClass("new-messages")
    scrollDown()
    return
  }

  var newChan = $("#chan-" + channelFilter(channel))
  newChan.removeAttr("hidden")
  var newChanSwitcher = $("#switchto-" + channelFilter(channel))
  newChanSwitcher.removeClass("new-messages")
  newChanSwitcher.addClass("active")
  scrollDown()
}

function channelFilter(channel) {
  return channel.replace("#", "\\#").toLowerCase()
}
