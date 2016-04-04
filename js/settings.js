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

function snNickChange(){
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

function updateSettingsValues(){
	$("#network-nickname").val(channelData[getActiveNetwork()]["*nick"])
  /*updateNetChoices()
  $("#settings-network-list").val(getActiveNetwork())

	updateChanChoices(getActiveChannel())
	$("#settings-channel-list").val(getActiveChannel())*/
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
