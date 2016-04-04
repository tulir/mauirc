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
  $("#channel-notifications").val(channelData[getActiveNetwork()][getActiveChannel()]["notifications"])
	$("#network-nickname").val(channelData[getActiveNetwork()]["*settings"]["nick"])
  var highlights = ""
  channelData[getActiveNetwork()]["*settings"]["highlights"].forEach(function(val, i, arr){
    highlights += val.replace(",", "\\,") + ","
  })
  highlights = highlights.slice(0, -1)
  $("#network-highlights").val(highlights)
}

function snChangeNotifications() {
  channelData[getActiveNetwork()][getActiveChannel()]["notifications"] = $("#channel-notifications").val()
}

function snChangeHighlights(){
	var hlData = $("#network-highlights").val()
  var highlights = [hlData]
  var minIndex = 0

  while(true) {
    var current = highlights.length - 1
    var str = highlights[current]
    var index = str.indexOf(",", minIndex)

    if (index === -1) {
      break
    } else if (index === 0) {
      highlights[current] = str.slice(1)
      minIndex = 1
      continue
    }

    if (str.charAt(index - 1) === "\\") {
      minIndex = index
      highlights[current] = str.slice(0, index - 1) + str.slice(index, str.length)
      continue
    } else if (index === str.length - 1) {
      highlights[current] = str.slice(0, str.length - 1)
      break
    }

    highlights[current] = str.slice(0, index)
    highlights.push(str.slice(index + 1, str.length))
    minIndex = 0
  }

  channelData[getActiveNetwork()]["*settings"]["highlights"] = highlights
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
    $("#title").html('<input \
      class="title-editor" \
      type="text" \
      id="title-editor" \
      autocomplete="off" \
      placeholder="Enter the topic..." \
      data-old-text="' + $("#title").text() + '" \
      onKeyDown="titleFinish(event)" \
      value="' + $("#title").text() + '" \
    />')
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
