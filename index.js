var socket = new WebSocket('ws://127.0.0.1/socket');
var connected = false

socket.onopen = function() {
  console.log("Connected!")
  connected = true
};

socket.onmessage = function (evt) {
  console.log(evt.data)
};

socket.onclose = function() {
  console.log("Disconnected!")
};

function send(){
  if (!connected) {
    console.log("Not yet connected!")
    return
  }
  var payload = {
    channel: "#mau",
    command: "privmsg",
    message: $("#message-text").val()
  }
  socket.send(JSON.stringify(payload))
  $("#message-text").val("")
}
