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
  $("#status-messages").loadTemplate($("#template-" + type), {
    message: message
  }, {append: true})
  if($("#status-messages").hasClass('hidden')) {
    $("#status-enter").addClass("new-messages")
  }
}

function scrollDown(){
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
}

function notify(user, message) {
  if (Notification.permission === "granted") {
    new Notification(user,{body: message, icon: '/favicon.ico'});
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
};

function escapeTag(tag) {
    return tagsToEscape[tag] || tag;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, escapeTag);
}

String.prototype.escapeRegex = function(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(this.escapeRegex(search), 'g'), replacement);
};
