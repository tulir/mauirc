var socket = null
var connected = false

function connect() {
  console.log("Connecting to socket...")
  socket = new WebSocket('ws://127.0.0.1/socket');

  socket.onopen = function() {
    console.log("Connected!")
    $("#nocon").addClass("hidden-xs-up")
    $('#message-send').removeAttr('disabled')
    $('#message-text').removeAttr('disabled')
    connected = true
  };

  socket.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    receive(data.network, data.channel, data.timestamp, data.sender, data.command, data.message)
  };

  socket.onclose = function() {
    connected = false
    $("#nocon").removeClass("hidden-xs-up")
    $('#message-send').attr('disabled', true)
    $('#message-text').attr('disabled', true)

    setTimeout(function() {
      connect();
    }, 5000)
    console.log("Disconnected!")
  };
}

function history(n){
  $.ajax({
    type: "GET",
    url: "/history?n=" + n,
    contentType: "application/json; charset=utf-8",
    success: function(data){
      data = JSON.parse(data)
      data.reverse().forEach(function(val, i, arr) {
        receive(val.network, val.channel, val.timestamp, val.sender, val.command, val.message)
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
connect();
