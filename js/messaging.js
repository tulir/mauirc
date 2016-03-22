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

function receive(network, channel, timestamp, sender, command, message, isNew){
  if (channel == "*mauirc") {
    var chanObj = $("#status-messages")
  } else {
    var chanObj = $("#chan-" + channelFilter(channel))
    if (chanObj.length == 0) {
      $("#messages").loadTemplate($("#template-channel-messages"), {
        channel: "chan-" + channel.toLowerCase()
      }, {append: true, isFile: false, async: false})
      $("#channels").loadTemplate($("#template-channel-switcher"), {
        channel: "switchto-" + channel.toLowerCase(),
        channelname: channel,
        onclick: "switchTo('" + channel.toLowerCase() + "')"
      }, {append: true, isFile: false, async: false})

      chanObj = $("#chan-" + channelFilter(channel))
    }
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
    $("#switchto-" + channelFilter(channel)).addClass("new-messages")
  } else {
    scrollDown()
  }
}
