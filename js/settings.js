function toggleSettings(){
	if ($("#settings").hasClass("hidden")) {
    openSettings()
  } else {
    closeSettings()
  }
}

function openSettings(){
  //updateSettingsValues()
  $("#settings").removeClass("hidden")
  $("#container").addClass("hidden")
}

function closeSettings(){
  $("#settings").addClass("hidden")
  $("#container").removeClass("hidden")
}

/*function updateSettingsValues(){
  updateNetChoices()
  $("#settings-network-list").val(getActiveNetwork())

	updateChanChoices(getActiveChannel())
	$("#settings-channel-list").val(getActiveChannel())

  //snNetUpdate()
	snChanUpdate(getActiveChannel())
}

function snChanUpdate(chan){
  if (isEmpty(chan)) {
    chan = $("#settings-channel-list").val()
  }
	if (chan == "MauIRC Status") {
    $("#channel-part").attr("disabled", true)
    $("#channel-clearhistory").attr("disabled", true)
  } else {
    if (chan.startsWith("#")) {
    	$("#channel-part").removeAttr("disabled")
    } else {
      $("#channel-part").attr("disabled", true)
    }
		$("#channel-clearhistory").removeAttr("disabled")
  }
}

function snNetUpdate(){
	updateChanChoices()
}

function updateChanChoices(channel) {
	var chanListObj = $("#settings-channel-list")
  chanListObj.empty()

  if (channel === "MauIRC Status") {
    chanListObj.append("<option value='MauIRC Status'>MauIRC Status</option>")
    return
  }

	var chanList = channelData[getActiveNetwork()]
	for (var key in chanList) {
		if (chanList.hasOwnProperty(key) && !isEmpty(chanList[key].userlist)) {
      chanListObj.append("<option value='" + key + "'>" + key + "</option>")
		}
	}
}

function updateNetChoices(){
	var netListObj = $("#settings-network-list")
	$("#settings-network-list option").remove()

  netListObj.html("<option value='MauIRC Status'>MauIRC Status</option>")

	for (var key in channelData) {
		if (channelData.hasOwnProperty(key)) {
			netListObj.html("<option value=" + key + ">" + key + "</option>")
		}
	}
}*/

function snClearHistory(){
  sendMessage({
    type: "clear",
    network: getActiveNetwork(),
    channel: getActiveChannel()
  })
  closeSettings()
}

function snPartChannel(){
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
