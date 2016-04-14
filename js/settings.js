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
  if (!data.channelExists(getActiveNetwork(), getActiveChannel())) {
    return
  }
  $("#channel-notifications").val(data.getChannel(getActiveNetwork(), getActiveChannel()).getNotificationLevel())
	$("#network-nickname").val(data.getNetwork(getActiveNetwork()).getNick())
  $("#network-highlights").val(data.getNetwork(getActiveNetwork()).getHighlightsAsString())
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

function snOpenScriptEditor(net, scripts) {
	$("#settings-main").addClass("hidden")
	$("#settings-networkeditor").addClass("hidden")
	$("#settings-scripts").removeClass("hidden")

	scripteditor = ace.edit("script-editor")
  scripteditor.setOptions({
    fontFamily: "Fira Code",
    fontSize: "11pt"
  });
	scripteditor.setShowPrintMargin(false)
	scripteditor.setTheme("ace/theme/chrome")
	scripteditor.getSession().setMode("ace/mode/golang")
	scripteditor.getSession().setUseWorker(false)
	scripteditor.getSession().setUseWrapMode(true)
  scripteditor.getSession().setUseSoftTabs(true)

	$("#script-list").empty()
	for (var key in scripts) {
    if (scripts.hasOwnProperty(key)) {
			$("#script-list").loadTemplate($("#template-script-list-entry"), {
				id: sprintf("chscript-%s", key),
				name: key,
				onclick: sprintf("snSwitchScript('%s', '%s')", net, key)
			}, {append: true, isFile: false, async: false})
    }
	}
}

function snSwitchScript(net, name) {
	var script
	if (net === "global") {
		script = data.getGlobalScript(name)
	} else {
		script = data.getNetwork(net).getScript(name)
	}
	if (script === undefined) {
		console.log("Script not found:", name, "@", net)
		return
	}
	$("#script-list > .active").removeClass("active")
	$(sprintf("#chscript-%s", name)).addClass("active")

	scripteditor.setValue(script, 1)
	$("#script-name").val(name)

  $("#script-tool-save").unbind("click")
	$("#script-tool-save").click(function(){
		snSaveScript(net, name)
	})
}

function snSaveScript(net, name) {
	var script = scripteditor.getValue()
	if (net === "global") {
		data.putGlobalScript(name, script)
	} else {
		data.getNetwork(net).putScript(name, script)
	}

	$.ajax({
		type: "PUT",
		url: sprintf("/script/%s/%s/", net, name),
    data: script,
		success: function(data){
      console.log("Successfully updated script", name, "@", net)
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Failed to update script", name, "@", net + ":", textStatus, errorThrown)
			console.log(jqXHR)
		}
	})
}

function snEditScripts() {
	snOpenScriptEditor(getActiveNetwork(), data.getNetwork(getActiveNetwork()).getScripts())
}

function snEditGlobalScripts() {
	snOpenScriptEditor("global", data.getGlobalScripts())
}
