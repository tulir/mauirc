var socket = new WebSocket('ws://127.0.0.1/socket');
var connected = false

socket.onopen = function() {
  console.log("Connected!")
  $("#nocon").addClass("hidden-xs-up")
  $('#message-send').removeAttr('disabled')
  $('#message-text').removeAttr('disabled')
  connected = true
};

socket.onmessage = function (evt) {
  console.log(evt.data)
};

socket.onclose = function() {
  console.log("Disconnected!")
  $("#nocon").removeClass("hidden-xs-up")
  $('#message-send').attr('disabled', true)
  $('#message-text').attr('disabled', true)
};

function send(){
  if (!connected) {
    console.log("Tried to send message without connection!")
    return
  }
  var message = JSON.stringify({
    channel: "#mau",
    command: "privmsg",
    message: $("#message-text").val()
  })
  if (message.length > 512) {
    alert("Message too long!")
  } else {
    socket.send(message)
    $("#message-text").val("")
  }
}
