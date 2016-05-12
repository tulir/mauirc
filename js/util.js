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

"use strict"
function showAlert(type, message) {
  "use strict"
  $("#status-messages").loadTemplate($(sprintf("#template-%s", type)), {
    message: message
  }, {append: true})
  if($("#status-messages").hasClass('hidden')) {
    $("#status-enter").addClass("new-messages")
  }
}

function sendMessage(payload) {
  "use strict"
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
  "use strict"
  $("#messages").scrollTop($("#messages")[0].scrollHeight)
}

function notify(user, message) {
  "use strict"
  if (Notification.permission === "granted") {
    new Notification(user,{body: message, icon: '/favicon.ico'})
  }
}

function isEmpty(object) {
  "use strict"
  return object === null || object === undefined || object.length === 0
}

function channelFilter(channel) {
  "use strict"
  return channel.replaceAll("#", "\\#").replaceAll("*", "\\*").replaceAll(".", "\\.").toLowerCase()
}

var tagsToEscape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}

function escapeTag(tag) {
  "use strict"
  return tagsToEscape[tag] || tag
}

function escapeHtml(str) {
  "use strict"
  return str.replace(/[&<>]/g, escapeTag)
}

String.prototype.escapeRegex = function(str) {
  "use strict"
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
}

String.prototype.replaceAll = function(search, replacement) {
  "use strict"
  return this.replace(new RegExp(this.escapeRegex(search), 'g'), replacement)
}


var italicEncRegex = new RegExp("_([^_]*)_", "g");
var boldEncRegex = new RegExp("\\*([^\\*]*)\\*", "g");
var underlineEncRegex = new RegExp("~([^~]*)~", "g");
var bothColorEncRegex = new RegExp("c(1[0-5]|[0-9])>([^<]*)<", "g")
var fgColorEncRegex = new RegExp("c(1[0-5]|[0-9]),(1[0-5]|[0-9])>([^<]*)<", "g")

function encodeMessage(msg){
  "use strict"
  msg = msg.replace(italicEncRegex, "\x1D$1\x1D")
  msg = msg.replace(boldEncRegex, "\x02$1\x02")
  msg = msg.replace(underlineEncRegex, "\x1F$1\x1F")
  msg = msg.replace(bothColorEncRegex, "\x03$1$2")
  msg = msg.replace(fgColorEncRegex, "\x03$1,$2$3")
  return msg
}

var colors = {
  0: "#FFFFFF",
  1: "#000000",
  2: "#00007F",
  3: "#009300",
  4: "#FF0000",
  5: "#7F0000",
  6: "#9C009C",
  7: "#FC7F00",
  8: "#FFFF00",
  9: "#00FC00",
  10: "#009393",
  11: "#00FFFF",
  12: "#0000FC",
  13: "#FF00FF",
  14: "#7F7F7F",
  15: "#D2D2D2"
}

var italicDecRegex = new RegExp("\x1D([^\x1D]*)?\x1D?", "g");
var boldDecRegex = new RegExp("\x02([^\x02]*)?\x02?", "g");
var underlineDecRegex = new RegExp("\x1F([^\x1F]*)?\x1F?", "g");
var bothColorDecRegex = new RegExp("\x03(1[0-5]|[0-9]),(1[0-5]|[0-9])([^\x03]*)?\x03?", "g")
var fgColorDecRegex = new RegExp("\x03(1[0-5]|[0-9])([^\x03]*)?\x03?", "g")

function decodeMessage(msg) {
  "use strict"
  msg = msg.replace(italicDecRegex, "<i>$1</i>")
  msg = msg.replace(boldDecRegex, "<b>$1</b>")
  msg = msg.replace(underlineDecRegex, "<u>$1</u>")
  msg = msg.replace(bothColorDecRegex, "<span style='color: $1; background-color: $2;'>$3</span>")
  msg = msg.replace(fgColorDecRegex, "<span style='color: $1;'>$2</span>")

  for (var i = 0; i < 16; i++) {
    msg = msg.replaceAll(sprintf("color: %d;", i), sprintf("color: %s;", colors[i]))
  }

  return msg
}

function removeFormatChars(msg) {
  "use strict"
  return msg.replace(/\x1D|\x02|\x1F|\x03/g, "")
}

function dbg() {
  "use strict"
  if (debug) {
    if (debugTrace) console.trace()
    console.log(arguments)
  }
}
