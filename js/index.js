var socket = null
var connected = false
var authfail = false
var gethistory = true

var email = null
var password = null

function auth(success) {
  if (!success) {
    $("#error").loadTemplate($("#template-error"), {
      message: "<b>Disconnected: Invalid username or password</b>"
    })
    authfail = true
    connected = false
  } else {
    console.log("Connected and authenticated!")
    $("#container").loadTemplate($("#template-main"), {})

    $("#messages").loadTemplate($("#template-success"), {
      message: "<b>Connected to server.<b>"
    }, {append: true})
    scrollDown()

    $('#message-send').removeAttr('disabled')
    $('#message-text').removeAttr('disabled')

    connected = true

    if (gethistory) {
      history(email, password, 1024)
      gethistory = false
    }
  }
}

function connect() {
  authfail = false
  console.log("Connecting to socket...")
  socket = new WebSocket('ws://127.0.0.1/socket');

  socket.onopen = function() {
    setTimeout(function() {
        socket.send(
          JSON.stringify({
            email: $("#email").val(),
            password: $("#password").val()
          })
        )
      }, 500);
  };
  email = $("#email").val()
  password = $("#password").val()
  socket.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    if (data.auth) {
      auth(data.success)
    } else {
      receive(data.network, data.channel, data.timestamp, data.sender, data.command, data.message)
    }
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

    if (!authfail) {
      setTimeout(function() {
        connect();
      }, 5000)
    }
  };
}

function history(email, password, n){
  payload = {
    email: email,
    password: password,
    n: n
  }
  $.ajax({
    type: "POST",
    url: "/history",
    data: JSON.stringify(payload),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){
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
    $("#messages").loadTemplate($("#template-message"), {
      sender: sender,
      date: moment(timestamp * 1000).format("HH:mm:ss"),
      message: message
    }, {append: true, isFile: false})
  } else if (command == "action") {
    $("#messages").loadTemplate($("#template-action"), {
      sender: sender,
      date: moment(timestamp * 1000).format("HH:mm:ss"),
      message: message
    }, {append: true, isFile: false})
  } else if (command == "join" || command == "part") {
    $("#messages").loadTemplate($("#template-joinpart"), {
      sender: sender,
      date: moment(timestamp * 1000).format("HH:mm:ss"),
      message: (command == "join" ? "joined " : "left: ") + message
    }, {append: true, isFile: false})
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

  var msg = $("#message-text").val()

  if (msg.startsWith("/") && msg.indexOf(' ') > 0) {
    command = msg.substr(1,msg.indexOf(' ')-1);
    args = msg.substr(msg.indexOf(' ')+1);

    switch(command) {
      case "me":
        var payload = {
          network: "pvlnet",
          channel: "#mau",
          command: "action",
          message: args
        }
        break;
      default:
        $("#messages").loadTemplate($("#template-error"), {
          message: "Unknown command: " + command
        }, {append: true})
    }
  } else {
    var payload = {
      network: "pvlnet",
      channel: "#mau",
      command: "privmsg",
      message: msg
    }
  }

  if (payload != null) {
    var content = JSON.stringify(payload)

    if (content.length > 1024) {
      alert("Message too long!")
    } else {
      socket.send(content)
      $("#message-text").val("")
    }
  }
}

$("email").val("mauircd@maunium.net")
$("password").val("opsalsasana123")
