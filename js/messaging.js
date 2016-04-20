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

function send() {
  if (!connected) {
    console.log("Tried to send message without connection!")
    return
  }

  var msg = $("#message-text").val()
  if (msg.length === 0) {
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
      scrollDown()
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
    scrollDown()
  } else {
    $("#message-text").val("")
  }
}

function receiveCmdResponse(message) {
  console.log("Received command response:", message)
}

function receive(id, network, channel, timestamp, sender, command, message, ownmsg, preview, isNew) {
  network = network.toLowerCase()
  var netObj = $(sprintf("#net-%s", network))
  if (netObj.length === 0) {
    openNetwork(network)
    netObj = $(sprintf("#net-%s", network))
  }
  var chanObj = $(sprintf("#chan-%s-%s", network, channelFilter(channel)))
  if (chanObj.length === 0) {
    openChannel(network, channel, false)
    chanObj = $(sprintf("#chan-%s-%s", network, channelFilter(channel)))
  }

  var templateData = {
    sender: sender,
    date: moment(timestamp * 1000).format("HH:mm:ss"),
    id: sprintf("msg-%d", id),
    wrapid: sprintf("msgwrap-%d", id),
    message: linkifyHtml(escapeHtml(message)),
    timestamp: timestamp
  }

  if (command === "action") {
    templateData.prefix = "<b>★</b> "
    templateData.class = "action"
    templateData.clipboard = "★ " + sender + " " + message
  } else if (command === "join" || command === "part" || command === "quit") {
    templateData.message = (command === "join" ? "joined " : "left: ") + templateData.message
    templateData.class = "joinpart"
    templateData.clipboard = sender + " " + (command === "join" ? "joined " : "left: ") + message
  } else if (command === "nick") {
    templateData.message = sprintf("is now known as <b>%s</b>", message)
    templateData.class = "nick"
    templateData.clipboard = sprintf("%s is now known as %s", sender, message)
  } else if (command == "topic") {
    templateData.message = sprintf("changed the topic to <b>%s</b>", message)
    templateData.class = "topic"
    templateData.clipboard = sprintf("%s changed the topic to %s", sender, message)
  } else {
    var template = "message"

    if (preview === null) {
      if (hasJoinedMessage(id) || tryJoinMessage(id, network, channel, timestamp, sender, command, templateData.message, ownmsg, isNew)) {
        return
      }
    }
  }

  templateData.class = "message " + templateData.class

  if (template === undefined) {
    var template = "action"
  }

  if($(sprintf("#msgwrap-%d", id)).length !== 0) {
    var loadedTempl = $("<div/>").loadTemplate($(sprintf("#template-%s", template)), templateData, {append: isNew, prepend: !isNew, isFile: false, async: false})
    $(sprintf("#msgwrap-%d", id)).replaceWith(loadedTempl.children(":first"))
  } else {
    chanObj.loadTemplate($(sprintf("#template-%s", template)), templateData, {append: isNew, prepend: !isNew, isFile: false, async: false})
  }

  if (ownmsg) {
    $(sprintf("#msgwrap-%d", id)).addClass("own-message")
    $(sprintf("#msg-%d > .message-sender", id)).remove()
  }
  var msgObj = $(sprintf("#msg-%d", id))
  if (preview !== null) {
    if (!isEmpty(preview.image) && !isEmpty(preview.text)) {
      var pwTemplate = "both"
    } else if (!isEmpty(preview.image)) {
      var pwTemplate = "image"
    } else if (!isEmpty(preview.text)) {
      var pwTemplate = "text"
    }
    if (pwTemplate !== undefined) {
      msgObj.loadTemplate($(sprintf("#template-message-preview-%s", pwTemplate)), {
        title: preview.text !== undefined ? preview.text.title : "",
        description: preview.text !== undefined && preview.text.description !== undefined ? preview.text.description.replaceAll("\n", "<br>") : "",
        sitename: preview.text !== undefined ? preview.text.sitename : "",
        image: preview.image !== undefined ? preview.image.url : "",
        modalopen: sprintf("modalOpen('%d')", id)
      }, {append: true, isFile: false, async: false})
    }
  }

  if (isNew) {
    var match = getHighlights(data.getNetwork(network), templateData.message)

    if (template === "message" && match !== null) {
      msgObj.find(".message-text").html(sprintf('%s<span class="highlighted-text">%s</span>%s',
        templateData.message.slice(0, match.index),
        templateData.message.slice(match.index, match.index + match.length),
        templateData.message.slice(match.index + match.length)
      ))
      msgObj.addClass("highlight")
    }

    notifyMessage(network, channel, match !== null, sender, message)
  } else {
    scrollDown()
  }
}

function getHighlights(network, message) {
  var match
  network.getHighlights().concat(new Highlight("contains", network.getNick())).some(function(val) {
    match = val.matches(message)
    if(match !== null) {
      return true
    }
    return false
  })
  return match
}

function notifyMessage(network, channel, highlight, sender, message) {
  var notifs = data.channelExists(network, channel) ? data.getChannel(network, channel).getNotificationLevel() : "all"

  if ((notifs == "all" || (notifs == "highlight" && highlight)) && !document.hasFocus()) {
    notify(sender, message)
  }
  if ($(sprintf("#chan-%s-%s", network, channelFilter(channel))).hasClass("hidden")) {
    if((notifs == "all" || (notifs == "highlight" && highlight))) {
      $(sprintf("#switchto-%s-%s", network, channelFilter(channel))).addClass("new-messages")
    }
  } else {
    scrollDown()
  }
}

function tryJoinMessage(id, network, channel, timestamp, sender, command, message, ownmsg, isNew) {
  var chanObj = $(sprintf("#chan-%s-%s", network, channelFilter(channel)))
  if(isEmpty(chanObj)) return

  if (!isNew) var prevMsg = chanObj.children(".message-wrapper:first")
  else var prevMsg = chanObj.children(".message-wrapper:last")
  if(isEmpty(prevMsg)) return

  if(prevMsg.attr("sender") != sender) return

  var prevMsgTime = prevMsg.attr("timestamp")
  if(isEmpty(prevMsgTime)) return

  if (!isNew) {
    if (parseInt(prevMsgTime) < timestamp + data.getMessageGroupDelay()) {
      prevMsg.find(".message > .message-text").prepend(message + "\n")
      prevMsg.find(".message > .message-date").html(moment(timestamp * 1000).format("HH:mm:ss"))
      prevMsg.attr("timestamp", timestamp)
      joinedMessages.push(id)
      return true
    }
  } else {
    if (parseInt(prevMsgTime) > timestamp - data.getMessageGroupDelay()) {
      var match = getHighlights(data.getNetwork(network), message)
      if (match !== null) {
        console.log(match)
        prevMsg.find(".message > .message-text").append(
          sprintf('\n%s<span class="highlighted-text">%s</span>%s',
            message.slice(0, match.index),
            message.slice(match.index, match.index + match.length),
            message.slice(match.index + match.length)
          )
        )
        prevMsg.find(".message").addClass("highlight")
      } else {
        prevMsg.find(".message > .message-text").append("\n" + escapeHtml(message))
      }
      scrollDown()
      prevMsg.attr("timestamp", timestamp)
      joinedMessages.push(id)
      notifyMessage(network, channel, match !== null, sender, message)
      return true
    }
  }
  return false
}

function hasJoinedMessage(id) {
  joinedMessages.forEach(function(val) {
    if (val == id) return true
  })
  return false
}

function modalOpen(id) {
  $('<img id="modal-' + id + '"\
      class="preview-modal" \
      src="' + $(sprintf("#msg-%d > .message-preview", id)).find(".preview-image-link > .preview-image").attr("src") + '" \
      alt="Full-sized Image" \
    />')
  .modal({
    fadeDuration: 100,
    fadeDelay: 0.8
  })
  $(sprintf("#modal-%d", id)).on($.modal.AFTER_CLOSE, function(event, modal) {
    $(sprintf("#modal-%d", id)).remove()
  })
}
