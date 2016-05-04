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

function showAlert(type, message) {
  $("#status-messages").loadTemplate($(sprintf("#template-%s", type)), {
    message: message
  }, {append: true})
  if($("#status-messages").hasClass('hidden')) {
    $("#status-enter").addClass("new-messages")
  }
}

function sendMessage(payload) {
  if(payload === undefined || payload === null || payload.length === 0) {
    return false
  }

  var content = JSON.stringify(payload)

  if (content.length > 1024) {
    return false
  }

  socket.send(content)
  return true
}

function scrollDown() {
  $("#messages").scrollTop($("#messages")[0].scrollHeight)
}

function notify(user, message) {
  if (Notification.permission === "granted") {
    new Notification(user,{body: message, icon: '/favicon.ico'})
  }
}

function isEmpty(object) {
  return object === null || object === undefined || object.length === 0
}

function channelFilter(channel) {
  return channel.replaceAll("#", "\\#").replaceAll("*", "\\*").replaceAll(".", "\\.").toLowerCase()
}

var tagsToEscape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
}

function escapeTag(tag) {
    return tagsToEscape[tag] || tag
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, escapeTag)
}

String.prototype.escapeRegex = function(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
}

String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(this.escapeRegex(search), 'g'), replacement)
}

String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

function encodeMessage(msg){
  for (var i = 0; i < msg.length; i++) {
    var repl
    var char = msg.charAt(i)
    switch (char) {
    case "~": // Italic
      repl = '\x1D'
      break
    case "*": // Bold
      repl = '\x02'
      break
    case "_": // Underline
      repl = '\x1F'
      break
    case "^": // Color
      repl = '\x03'
    default:
      continue
    }
    nextIndex = msg.indexOf(char, i + 1)
    if (nextIndex !== -1) {
      msg = msg.replaceAt(i, repl).replaceAt(nextIndex, repl)
    }
  }
  return msg
}

function decodeMessage(msg) {
  for (var i = 0; i < msg.length; i++) {
    var repl
    var char = msg.charAt(i)
    switch (char) {
    case '\x1D': // Italic
      repl = 'i'
      break
    case '\x02': // Bold
      repl = 'b'
      break
    case '\x1F': // Underline
      repl = 'u'
      break
    case '\x03': // Color
      // TODO colors?
    default:
      continue
    }
    nextIndex = msg.indexOf(char, i + 1)
    if (nextIndex !== -1) {
      // TODO fix the loop or this replace (length changes)
      msg = msg.replaceAt(i, "<" + repl + ">").replaceAt(nextIndex, "</" + repl + ">")
    }
  }
  return msg
}
