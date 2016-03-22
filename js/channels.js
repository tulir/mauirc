function getActiveChannel(){
  let active = $(".channel-messages:visible")
  if (active.length) {
    let id = active.attr('id')
    if (id == "status-messages") {
      return "*mauirc"
    } else if (id.length > 5) {
      return id.substring(5, id.length)
    }
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
