function openSettings(){
	if ($("#messaging").hasClass("hidden-tablet-down")) {
    switchView(false)
  }

	$('#settings').modal({
		fadeDuration: 100,
		clickClose: false,
		showClose: true
	})
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
    socket.send(JSON.stringify({
      type: "message",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      command: "topic",
      message: $("#title-editor").val()
    }))
  } else if (event.keyCode !== 27) {
    return
  }
  $("#title").text($("#title-editor").attr("data-old-text"))
  event.preventDefault()
}
