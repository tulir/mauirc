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
  "use strict"
  if (!connected) {
    dbg("Tried to send message without connection!")
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
      message: encodeMessage(msg)
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
  "use strict"
  dbg("Received command response:", message)
}

function receive(id, network, channel, timestamp, sender, command, message, ownmsg, preview, isNew) {
  "use strict"
  network = network.toLowerCase()
  var netObj = $(sprintf("#net-%s", network))
  if (netObj.length === 0) {
    if (command == "part" && sender == data.getNetwork(network).getNick()) return
    openNetwork(network)
    netObj = $(sprintf("#net-%s", network))
  }
  var chanObj = $(sprintf("#chan-%s-%s", network, channelFilter(channel)))
  if (chanObj.length === 0) {
    if (command == "part" && sender == data.getNetwork(network).getNick()) return
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
    templateData.clipboard = sprintf("* %s %s", sender, message)
  } else if (command === "join" || command === "part" || command === "quit") {
    templateData.message = (command === "join" ? "joined " : "left: ") + templateData.message
    templateData.class = "joinpart"
    templateData.clipboard = sprintf("%s %s %s", sender, command === "join" ? "joined" : "left:", message)
  } else if (command === "kick") {
    var index = message.indexOf(":")
    var kicker = templateData.sender
    sender = message.substr(0, index)
    message = message.substr(index + 1)
    templateData.sender = sender
    templateData.message = sprintf("was kicked by <b>%s</b>: <b>%s</b>", kicker, linkifyHtml(escapeHtml(message)))
    templateData.class = "action"
    templateData.clipboard = sprintf("%s was kicked by %s: %s", sender, kicker, message)
  } else if (command === "mode") {
    var parts = message.split(" ")
    if (parts.length > 1) {
      templateData.message = sprintf("set mode <b>%s</b> for <b>%s</b>", parts[0], parts[1])
      templateData.clipboard = sprintf("set mode %s for %s", parts[0], parts[1])
    } else {
      templateData.message = sprintf("set channel mode <b>%s</b>", parts[0])
      templateData.clipboard = sprintf("set channel mode %s", parts[0])
    }
    templateData.class = "action"
  } else if (command === "nick") {
    templateData.message = sprintf("is now known as <b>%s</b>", message)
    templateData.class = "nickchange"
    templateData.clipboard = sprintf("%s is now known as %s", sender, message)
  } else if (command == "topic") {
    templateData.message = sprintf("changed the topic to <b>%s</b>", message)
    templateData.class = "topic"
    templateData.clipboard = sprintf("%s changed the topic to %s", sender, message)
  } else {
    var template = "message"
    var join = tryJoinMessage(id, network, channel, timestamp, sender, command, templateData.message, ownmsg)
  }

  templateData.wrapclass = "message-wrapper" + (ownmsg ? " own-message-wrapper" : "")
  templateData.class = "message " + templateData.class + (ownmsg ? " own-message" : "")
  templateData.message = decodeMessage(templateData.message)

  if (template === undefined) {
    var template = "action"
  }

  if($(sprintf("#msgwrap-%d", id)).length !== 0) {
    var loadedTempl = $("<div></div>").loadTemplate($(sprintf("#template-%s", template)), templateData, {append: true, isFile: false, async: false})
    $(sprintf("#msgwrap-%d", id)).replaceWith(loadedTempl.children(":first"))
  } else {
    chanObj.loadTemplate($(sprintf("#template-%s", template)), templateData, {append: true, isFile: false, async: false})
  }

  if (ownmsg || join) {
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

  var match = getHighlights(data.getNetwork(network), templateData.message)

  if (template === "message" && match !== null) {
    msgObj.find(".message-text").html(sprintf('%s<span class="highlighted-text">%s</span>%s',
      templateData.message.slice(0, match.index),
      templateData.message.slice(match.index, match.index + match.length),
      templateData.message.slice(match.index + match.length)
    ))
    msgObj.addClass("highlight")
  }

  if (isNew) {
    notifyMessage(network, channel, match !== null, sender, message)
  }
}

function getHighlights(network, message) {
  "use strict"
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
  "use strict"
  message = removeFormatChars(message)
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

function tryJoinMessage(id, network, channel, timestamp, sender, command, message, ownmsg) {
  "use strict"
  var chanObj = $(sprintf("#chan-%s-%s", network, channelFilter(channel)))
  if(isEmpty(chanObj)) return false

  var prevMsg = chanObj.children(".message-wrapper:last")
  if(isEmpty(prevMsg)) return false

  if(prevMsg.attr("sender") != sender) return false
  prevMsg.addClass("message-joined")
  return true
}

function modalOpen(id) {
  "use strict"
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
