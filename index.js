var socket = null
var connected = false
var gethistory = true

function connect() {
  console.log("Connecting to socket...")
  socket = new WebSocket('ws://127.0.0.1/socket');

  socket.onopen = function() {
    if (!connected) {
      console.log("Connected!")

      $("#messages").loadTemplate($("#template-success"), {
        message: "<b>Connected to server.<b>"
      }, {append: true})
      scrollDown()

      $('#message-send').removeAttr('disabled')
      $('#message-text').removeAttr('disabled')

      connected = true
    }

    if (gethistory) {
      history(1024)
      gethistory = false
    }
  };

  socket.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    receive(data.network, data.channel, data.timestamp, data.sender, data.command, data.message)
  };

  socket.onclose = function() {
    if (connected) {
      connected = false

      $("#messages").loadTemplate($("#template-error"), {
        message: "<b>Disconnected from server!</b>"
      }, {append: true})
      scrollDown()
      $('#message-send').attr('disabled', true)
      $('#message-text').attr('disabled', true)

      console.log("Disconnected!")
    }

    setTimeout(function() {
      connect();
    }, 5000)
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
      scrollDown()
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
    }, {append: true})
  }
  scrollDown()
}

function scrollDown(){
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
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
  if (message.length > 1024) {
    alert("Message too long!")
  } else {
    socket.send(message)
    $("#message-text").val("")
  }
}

connect();
