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
  evt.data = JSON.parse(evt.data)
  receive(evt.data.network, evt.data.channel, evt.data.timestamp, evt.data.sender, evt.data.command, evt.data.message)
};

socket.onclose = function() {
  console.log("Disconnected!")
  $("#nocon").removeClass("hidden-xs-up")
  $('#message-send').attr('disabled', true)
  $('#message-text').attr('disabled', true)
};

function history(n){
  $.ajax({
    type: "GET",
    url: "/history?n=" + n,
    contentType: "application/json; charset=utf-8",
    success: function(data){
      data = JSON.parse(data)
      for (var i = data.length + 1; i > 0; i++)
      data.forEach(function(val, i, array) {
        receive(data[i].network, data[i].channel, data[i].timestamp, data[i].sender, data[i].command, data[i].message)
      })
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR)
      console.log(textStatus)
      console.log(errorThrown)
    }
  });
}

function receive(network, channel, timestamp, sender, command, message){
  if (command == "privmsg") {
    console.log(moment(timestamp * 1000).format("HH:mm DD.MM.YYYY") + " || " + channel + "@" + network + " || <" + sender + "> " + message);
    $("#messages").loadTemplate("message.html", {
      sender: sender,
      date: moment(timestamp * 1000).format("HH:mm:ss DD.MM.YYYY"),
      message: message
    }, {append: true, elemPerPage: 20})
  }
}

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

history(10)
