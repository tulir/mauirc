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

function settings(){}

settings.toggle = function () {
  "use strict"
  if ($("#settings").hasClass("hidden")) {
    settings.open()
  } else {
    settings.close()
  }
}

settings.open = function () {
  "use strict"
  settings.updateValues()
  $("#settings").removeClass("hidden")
  $("#container").addClass("hidden")
}

settings.close = function () {
  "use strict"
  $("#settings").addClass("hidden")
  $("#container").removeClass("hidden")
}

settings.updateValues = function () {
  "use strict"
  $("#network-nickname").val("")
  $("#network-highlights").val("")
  $("#channel-notifications").val("all")

  if (isEmpty(document.body.style.fontFamily)) {
    $("#mauirc-font").val("Raleway")
  } else {
    $("#mauirc-font").val(document.body.style.fontFamily)
  }

  if (!data.networkExists(getActiveNetwork())) {
    return
  }
  $("#network-nickname").val(data.getNetwork(getActiveNetwork()).getNick())
  $("#network-highlights").val(data.getNetwork(getActiveNetwork()).getHighlightsAsString())
  if (!data.channelExists(getActiveNetwork(), getActiveChannel())) {
    return
  }
  $("#channel-notifications").val(data.getChannel(getActiveNetwork(), getActiveChannel()).getNotificationLevel())
}

settings.changeNotifications = function () {
  "use strict"
  data.getChannel(getActiveNetwork(), getActiveChannel()).setNotificationLevel($("#channel-notifications").val())
}

settings.changeHighlights = function () {
  "use strict"
  data.getNetwork(getActiveNetwork()).setHighlightsFromString($("#network-highlights").val())
}

settings.clearHistory = function () {
  "use strict"
  sendMessage({
    type: "clear",
    network: getActiveNetwork(),
    channel: getActiveChannel()
  })
  settings.close()
}

settings.changeNick = function () {
  "use strict"
  var nick = $("#network-nickname")
  if (nick.length === 0 || nick.val().trim().length === 0) {
    return
  }

  sendMessage({
    type: "message",
    network: getActiveNetwork(),
    channel: getActiveChannel(),
    command: "nick",
    message: nick.val().trim()
  })
  settings.close()
}

settings.updateFont = function () {
  "use strict"
  document.body.style.fontFamily = $("#mauirc-font").val()
}

settings.partAndClose = function () {
  "use strict"
  if(getActiveChannel().startsWith("#")) {
    sendMessage({
      type: "message",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      command: "part",
      message: "Leaving"
    })
  } else {
    sendMessage({
      type: "close",
      network: getActiveNetwork(),
      channel: getActiveChannel()
    })
  }

  closeChannel(getActiveNetwork(), getActiveChannel())
  settings.close()
}

settings.titleEdit = function () {
  "use strict"
  if ($("#title-editor").length !== 0) {
    return
  }
  var now = Date.now()
  if (now - titleEditClick <= 500) {
    $("#title").loadTemplate($("#template-title-editor"), {title: $("#title").text()}, {append: false, isFile: false, async: false})
    $("#title-editor").focus()
    titleEditClick = 0
  } else {
    titleEditClick = now
  }
}

settings.titleFinish = function (keyCode, event) {
  "use strict"
  if (keyCode === 13) {
    sendMessage({
      type: "message",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      command: "topic",
      message: $("#title-editor").val()
    })
  } else if (keyCode !== 27) {
    return
  }
  $("#title").text($("#title-editor").attr("data-old-text"))
  if (event) event.preventDefault()
}
