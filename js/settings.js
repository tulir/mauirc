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

function toggleSettings(){
	if ($("#settings").hasClass("hidden")) {
    openSettings()
  } else {
    closeSettings()
  }
}

function openSettings(){
  updateSettingsValues()
  $("#settings").removeClass("hidden")
  $("#container").addClass("hidden")
}

function closeSettings(){
  $("#settings").addClass("hidden")
  $("#container").removeClass("hidden")
}

function updateSettingsValues(){
  $("#mauirc-font").val("")
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

function snChangeNotifications() {
  data.getChannel(getActiveNetwork(), getActiveChannel()).setNotificationLevel($("#channel-notifications").val())
}

function snChangeHighlights(){
  data.getNetwork(getActiveNetwork()).setHighlightsFromString($("#network-highlights").val())
}

function snClearHistory(){
	if(getActiveChannel() === "MauIRC Status") return
  sendMessage({
    type: "clear",
    network: getActiveNetwork(),
    channel: getActiveChannel()
  })
  closeSettings()
}

function snCloseChannel(){
	closeChannel(getActiveNetwork(), getActiveChannel())
	closeSettings()
}

function snChangeNick(){
	if(getActiveChannel() === "MauIRC Status") return
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
	closeSettings()
}

function snUpdateFont() {
	document.body.style.fontFamily = $("#mauirc-font").val();
}

function snPartChannel(){
	if(getActiveChannel() === "MauIRC Status") return
  sendMessage({
    type: "message",
    network: getActiveNetwork(),
    channel: getActiveChannel(),
    command: "part",
    message: "Leaving"
  })
  closeSettings()
}

function titleEdit() {
  if ($("#title-editor").length !== 0) {
    return
  }
  var now = Date.now()
  if (now - titleEditClick <= 500) {
    $("#title").html(sprintf('<input \
      class="title-editor" \
      type="text" \
      id="title-editor" \
      autocomplete="off" \
      placeholder="Enter the topic..." \
      data-old-text="%1$s" \
      onKeyDown="titleFinish(event)" \
      value="%1$s" \
    />', $("#title").text()))
    $("#title-editor").focus()
    titleEditClick = 0
  } else {
    titleEditClick = now
  }
}

function titleFinish(event) {
  if (event.keyCode === 13) {
    sendMessage({
      type: "message",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      command: "topic",
      message: $("#title-editor").val()
    })
  } else if (event.keyCode !== 27) {
    return
  }
  $("#title").text($("#title-editor").attr("data-old-text"))
  event.preventDefault()
}
