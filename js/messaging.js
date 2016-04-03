// mauIRC - The original mauIRC web frontend
// Copyright (C) 2016 Tulir Asokan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

function send(){
  if (!connected) {
    console.log("Tried to send message without connection!")
    return
  }

  var msg = $("#message-text").val()
  if (msg.length === 0) {
    return
  }

  if (getActiveChannel() === "MauIRC Status") {
    statusCommand()
    return
  }

  if (msg.startsWith("/")) {
    var args = msg.split(" ")
    command = args[0].substring(1, args[0].length).toLowerCase()
    if (args.length > 1) {
      args = args.slice(1, args.length)
    } else {
      args = []
    }

    switch(command) {
    case "me":
      var payload = {
        type: "message",
        network: getActiveNetwork(),
        channel: getActiveChannel(),
        command: "action",
        message: args.join(" ")
      }
      break
    case "topic":
    case "title":
      var payload = {
        type: "message",
        network: getActiveNetwork(),
        channel: getActiveChannel(),
        command: "topic",
        message: args.join(" ")
      }
      break
    case "nick":
    case "name":
    case "nickname":
      var payload = {
        type: "message",
        network: getActiveNetwork(),
        channel: getActiveChannel(),
        command: "nick",
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
          type: "message",
          network: getActiveNetwork(),
          channel: args[0],
          command: "privmsg",
          message: args.slice(1, args.length).join(" ")
        }
        break
      }
    case "join":
      if (args.length > 0) {
        var payload = {
          type: "message",
          network: args.length > 1 ? args[1] : getActiveNetwork(),
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
        type: "message",
        network: args.length > 1 ? args[1] : getActiveNetwork(),
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
      type: "message",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      command: "privmsg",
      message: msg
    }
  }

  if (!sendMessage(payload)) {
    getActiveChannelObj().loadTemplate($("#template-error"), {
      message: "Message too long!"
    }, {append: true})
    scrollDown();
  } else {
    $("#message-text").val("")
  }
}

function statusCommand() {
  var args = $("#message-text").val().split(" ")
  command = args[0].toLowerCase()
  if (args.length > 1) {
    args = args.slice(1, args.length)
  } else {
    args = []
  }

  switch(command) {
  case "deletemessage":
    if (args.length > 0) {
      var payload = {
        type: "delete",
        id: args[0],
      }
    }
    break
  case "importscript":
    if (args.length > 3) {
      var payload = {
        type: "importscript",
        name: args[1],
        url: args[2],
        network: args[0]
      }
    } else if (args.length > 2) {
      var payload = {
        type: "importscript",
        name: args[0],
        url: args[1]
      }
    }
    break
  }
  if(sendMessage(payload)) {
    $("#message-text").val("")
  }
}

function receiveCmdResponse(message) {
  var statusMsgs = $("#status-messages")
  statusMsgs.loadTemplate($("#template-message"), {
    sender: "mauIRCd",
    date: "",
    id: "cmdresponse",
    message: linkifyHtml(message)
  }, {append: true, isFile: false, async: false})

  if (!document.hasFocus() && isNew) {
    notify(sender, message)
  }

  if (statusMsgs.hasClass("hidden")){
    $("#status-enter").addClass("new-messages")
  } else {
    scrollDown()
  }
}

function receive(id, network, channel, timestamp, sender, command, message, ownmsg, preview, isNew) {
  network = network.toLowerCase()
  var netObj = $("#net-" + network)
  if (netObj.length === 0) {
    openNetwork(network)
    netObj = $("#net-" + network)
  }
  var chanObj = netObj.find("#chan-" + channelFilter(channel))
  if (chanObj.length === 0) {
    openChannel(network, channel)
    chanObj = netObj.find("#chan-" + channelFilter(channel))
  }

  var templateData = {
    sender: sender + " ",
    date: moment(timestamp * 1000).format("HH:mm:ss"),
    id: "msg-" + id,
    wrapid: "msgwrap-" + id,
    message: linkifyHtml(escapeHtml(message))
  }

  var shouldEscapeHtml = true
  if (command === "action") {
    templateData.prefix = "<b>★</b> "
    templateData.class = "action"
  } else if (command === "join" || command === "part" || command === "quit") {
    templateData.message = (command === "join" ? "joined " : "left: ") + templateData.message
    templateData.class = "joinpart"
  } else if (command === "nick") {
    templateData.message = "is now known as <b>" + message + "</b>"
    templateData.class = "nick"
  } else if (command == "topic") {
    templateData.message = "changed the topic to " + message
    templateData.class = "topic"
  } else {
    var template = "message"
  }

  templateData.class = "message " + templateData.class

  if (template === undefined) {
    var template = "action"
  }

  chanObj.loadTemplate($("#template-" + template), templateData, {append: true, isFile: false, async: false})

  if (ownmsg) {
    $("#msgwrap-" + id).addClass("own-message")
    $("#msg-" + id + " > .message-sender").remove()
  }

  if (preview !== null) {
    if (!isEmpty(preview.image) && !isEmpty(preview.text)) {
      var pwTemplate = "both"
    } else if (!isEmpty(preview.image)) {
      var pwTemplate = "image"
    } else if (!isEmpty(preview.text)) {
      var pwTemplate = "text"
    }
    if (pwTemplate !== undefined) {
      var a = $("#msg-" + id).loadTemplate($("#template-message-preview-" + pwTemplate), {
        title: preview.text !== undefined ? preview.text.title : "",
        description: preview.text !== undefined && preview.text.description !== undefined ? preview.text.description.replaceAll("\n", "<br>") : "",
        sitename: preview.text !== undefined ? preview.text.sitename : "",
        image: preview.image !== undefined ? preview.image.url : "",
        modalopen: "modalOpen('" + id + "')"
      }, {append: true, isFile: false, async: false})
    }
  }

  if (!document.hasFocus() && isNew) {
    notify(sender, message)
  }

  if (chanObj.hasClass("hidden") && isNew){
    $("#switchto-" + channelFilter(channel)).addClass("new-messages")
  } else {
    scrollDown()
  }
}

function modalOpen(id) {
  $('<img id="modal-' + id + '"\
      class="preview-modal" \
      src="' + $("#msg-" + id + " > .message-preview").find(".preview-image-link > .preview-image").attr("src") + '" \
      alt="Full-sized Image" \
    />')
  .modal({
    fadeDuration: 100,
    fadeDelay: 0.8
  })
  $("#modal-" + id).on($.modal.AFTER_CLOSE, function(event, modal) {
    $("#modal-" + id).remove()
  });
}
