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

function addScripts() {
	data.getNetwork("pvlnet").putScript("siltafilter", `if event.GetCommand() == "privmsg" && event.GetChannel() == "#mau" && event.GetSender() == "tulir293" {
    var pattern = import("regexp").MustCompile("<([^>]+)>")
    var match = pattern.FindString(event.GetMessage())
    if len(match) > 2 {
        match = match[1:len(match)-1]
        var msg = toByteSlice(toString(event.GetMessage()))

        event.SetMessage(toString(msg[len(match)+3:len(msg)]))
        event.SetSender(match + " [S]")
    }
}`)
	data.getNetwork("pvlnet").putScript("nickserv", `var strings = import("strings")
if event.GetCommand() == "privmsg" && strings.ToLower(event.GetChannel()) == "nickserv" && strings.ToLower(event.GetSender()) != "nickserv" {
	  if event.GetMessage() != "IDENTIFY *********" && strings.HasPrefix(strings.ToLower(event.GetMessage()), "identify ") {
			  event.SetCancelled(true)
				go network.irc.Privmsg(event.GetChannel(), event.GetMessage())
				go user.SendMessage(event.GetID(), event.GetNetwork(), event.GetChannel(), event.GetTimestamp(), event.GetSender(), event.GetCommand(), "IDENTIFY *********", true)
		}
}`)
}

function snOpenScriptEditor(net, scripts) {
	$("#settings-main").addClass("hidden")
	$("#settings-networkeditor").addClass("hidden")
	$("#settings-scripts").removeClass("hidden")

	scripteditor = ace.edit("script-editor")
	scripteditor.setShowPrintMargin(false)
	scripteditor.setTheme("ace/theme/xcode")
	scripteditor.getSession().setMode("ace/mode/golang")
	scripteditor.getSession().setUseWorker(false)
	scripteditor.getSession().setUseWrapMode(true)

	$("#script-list").empty()
	for (var key in scripts) {
    if (scripts.hasOwnProperty(key)) {
			$("#script-list").loadTemplate($("#template-script-list-entry"), {
				id: "chscript-" + key,
				name: key,
				onclick: "snSwitchScript('" + net + "', '" + key + "')"
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
		console.log("Script not found: " + net + ", " + name)
		return
	}
	$("#script-list > .active").removeClass("active")
	$("#chscript-" + name).addClass("active")

	scripteditor.resize()
  scripteditor.renderer.updateFull()
	scripteditor.setValue(script, 1)

	$("#script-tool-save").click(function(){
		snSwitchScript(net, name)
	})
}

function snSaveScript(net, name) {
	var script = scripteditor.val()
	if (net === "global") {
		data.putGlobalScript(name, script)
	} else {
		data.getNetwork(net).putScript(name, script)
	}
}

function snEditScripts() {
	snOpenScriptEditor(getActiveNetwork(), data.getNetwork(getActiveNetwork()).getScripts())
}

function snEditGlobalScripts() {
	snOpenScriptEditor("global", data.getGlobalScripts())
}
