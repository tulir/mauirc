var socket = null
var connected = false
var authfail = false
var msgcontainer = false

function auth() {
  authfail = false
  payload = {
    email: $("#email").val(),
    password: $("#password").val()
  }
  $.ajax({
    type: "POST",
    url: "/auth",
    data: JSON.stringify(payload),
    contentType: "application/json; charset=utf-8",
    success: function(data){
      console.log("Successfully authenticated!")
      connect()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Authentication failed: " + textStatus)
      authfail = true
    }
  });
}

function checkAuth(){
  authfail = false
  $.ajax({
    type: "GET",
    url: "/authcheck",
    success: function(data){
      if (data == "true") {
        connect()
      } else {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Auth check failed: " + textStatus)
      authfail = true
      $("#container").loadTemplate($("#template-login"), {})
      console.log(jqXHR)
    }
  });
}

function reconnect(){
  $.ajax({
    type: "GET",
    url: "/authcheck",
    success: function(data){
      if (data == "true") {
        connect()
      } else {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      if(jqXHR.status == 401) {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      } else {
        setTimeout(reconnect, 5000)
      }
    }
  });
}

function connect() {
  console.log("Connecting to socket...")
  socket = new WebSocket('ws://' + window.location.host + '/socket');

  socket.onopen = function() {
    if (!msgcontainer) {
      $("#container").loadTemplate($("#template-main"), {})

      $("#messages").loadTemplate($("#template-channel-messages"), {
        channel: "status-messages"
      }, {append: true, isFile: false, async: false})
      $("#channels").loadTemplate($("#template-channel-switcher"), {
        channel: "status-enter",
        channelname: "MauIRC Status",
        onclick: "switchTo('*mauirc')"
      }, {append: true, isFile: false, async: false})

      $("#status-messages").removeAttr("hidden")
      $("#status-enter").addClass("active")
      $("#message-text").focus()

      history(1024)
      msgcontainer = true
    }

    showAlert("success", "<b>Connected to server.<b>")

    $('#message-send').removeAttr('disabled')
    $('#message-text').removeAttr('disabled')

    console.log("Connected!")
    connected = true
  };

  socket.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    receive(data.network, data.channel, data.timestamp, data.sender, data.command, data.message, true)
  };

  socket.onclose = function(evt) {
    if (evt.wasClean) {
      return
    }
    if (connected) {
      connected = false

      showAlert("error", "<b>Disconnected from server!</b>")
      scrollDown()
      $('#message-send').attr('disabled', true)
      $('#message-text').attr('disabled', true)

      console.log("Disconnected!")
    }
    if (!authfail) {
      setTimeout(reconnect, 2500)
    }
  };
}

function showAlert(type, message) {
  $("#status-messages").loadTemplate($("#template-" + type), {
    message: message
  }, {append: true})
  if($("#status-messages").attr('hidden')) {
    $("#status-enter").addClass("new-messages")
  }
}

function history(n){
  $.ajax({
    type: "GET",
    url: "/history?n=" + n,
    dataType: "json",
    success: function(data){
      data.reverse().forEach(function(val, i, arr) {
        receive(val.network, val.channel, val.timestamp, val.sender, val.command, val.message, false)
      })
      scrollDown()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      showAlert("error", "Failed to fetch history: " + textStatus + " " + errorThrown)
      scrollDown()
      console.log(jqXHR)
    }
  });
}

function getActiveChannel(){
  let active = $(".channel-messages:visible")
  if (active.length) {
    let id = active.attr('id')
    if (id.length > 5) {
      return id.substring(5, id.length)
    }
  }
  return ""
}

function getActiveChannelObj(){
  return $(".channel-messages:visible")
}

function switchTo(channel) {
  console.log("Switching to channel " + channel)
  getActiveChannelObj().attr("hidden", true)
  $(".channel-switcher.active").removeClass("active")
  $("#message-text").focus()

  if (channel == "*mauirc") {
    $("#status-messages").removeAttr("hidden")
    $("#status-enter").addClass("active")
    $("#status-enter").removeClass("new-messages")
    scrollDown()
    return
  }

  var newChan = $("#chan-" + channel.replace("#", "\\#"))
  newChan.removeAttr("hidden")
  var newChanSwitcher = $("#switchto-" + channel.replace("#", "\\#"))
  newChanSwitcher.removeClass("new-messages")
  newChanSwitcher.addClass("active")
  scrollDown()
}

function receive(network, channel, timestamp, sender, command, message, isNew){
  var chanObj = $("#chan-" + channel.replace("#", "\\#"))
  if (chanObj.length == 0) {
    $("#messages").loadTemplate($("#template-channel-messages"), {
      channel: "chan-" + channel
    }, {append: true, isFile: false, async: false})
    $("#channels").loadTemplate($("#template-channel-switcher"), {
      channel: "switchto-" + channel,
      channelname: channel,
      onclick: "switchTo('" + channel + "')"
    }, {append: true, isFile: false, async: false})

    chanObj = $("#chan-" + channel.replace("#", "\\#"))
  }

  if (command == "privmsg") {
    template = "message"
  } else if (command == "action") {
    template = "action"
  } else if (command == "join" || command == "part") {
    template = "joinpart"
    message = (command == "join" ? "joined " : "left: ") + message
  }

  chanObj.loadTemplate($("#template-" + template), {
    sender: sender,
    date: moment(timestamp * 1000).format("HH:mm:ss"),
    message: message
  }, {append: true, isFile: false, async: false})

  if (!document.hasFocus() && isNew) {
    notify(sender, message)
  }

  if (chanObj.attr("hidden") !== undefined && isNew){
    $("#switchto-" + channel.replace("#", "\\#")).addClass("new-messages")
  } else {
    scrollDown()
  }
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

  if (msg.startsWith("/")) {
    var args = msg.split(" ")
    command = args[0].substring(1, args[0].length)
    if (args.length > 1) {
      args = args.slice(1, args.length)
    } else {
      args = []
    }

    switch(command) {
    case "me":
      var payload = {
        network: "pvlnet",
        channel: getActiveChannel(),
        command: "action",
        message: args.join(" ")
      }
      break
    case "msg":
    case "message":
    case "query":
    case "q":
    case "privmsg":
      if (args.length > 1) {
        var payload = {
          network: "pvlnet",
          channel: args[0],
          command: "privmsg",
          message: args.slice(1, args.length).join(" ")
        }
        break
      }
    case "join":
      if (args.length > 0) {
        var payload = {
          network: "pvlnet",
          channel: args[0],
          command: "join",
          message: "Joining"
        }
        break
      }
    case "part":
    case "leave":
    case "quit":
    case "exit":
      var payload = {
        network: "pvlnet",
        channel: args.length > 0 ? args[0] : getActiveChannel(),
        command: "part",
        message: "Leaving"
      }
      break
    default:
      getActiveChannelObj().loadTemplate($("#template-error"), {
        message: "Unknown command: " + command
      }, {append: true})
      scrollDown();
      $("#message-text").val("")
    }
  } else {
    var payload = {
      network: "pvlnet",
      channel: getActiveChannel(),
      command: "privmsg",
      message: msg
    }
  }

  if (payload != null) {
    var content = JSON.stringify(payload)

    if (content.length > 1024) {
      getActiveChannelObj().loadTemplate($("#template-error"), {
        message: "Message too long!"
      }, {append: true})
      scrollDown();
    } else {
      socket.send(content)
      $("#message-text").val("")
    }
  }
}

function notify(user, message) {
  if (Notification.permission === "granted") {
    var n = new Notification(user,{body: message});
  }
}

checkAuth()

Notification.requestPermission()
