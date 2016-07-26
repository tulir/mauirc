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

function updateUserList() {
  "use strict"
  var ch = data.getChannelIfExists(getActiveNetwork(), getActiveChannel())
  if (ch !== undefined && !isEmpty(ch.getUsers())) {
    if (isUserListHidden() && !wasUserListHiddenManually()) toggleUserList(false)

    $("#userlist-list").text("")
    ch.getUsers().forEach(function(val, i, arr) {
      var plainUser = ch.getUsersPlain()[i]
      $("#userlist-list").loadTemplate($("#template-userlist-entry"), {
        onclick: sprintf("openPM('%s', '%s')", getActiveNetwork(), plainUser),
        simplename: plainUser,
        displayname: val
      }, {append: true, isFile: false, async: false})
    })
    $("#userlist-list").loadTemplate($("#template-userlist-invite"), {}, {append: true, isFile: false, async: false})
    $("#open-user-list").removeClass("hidden-medium-down")
    $("#open-settings").addClass("hidden-medium-down")
    return
  }

  if (!isUserListHidden()) toggleUserList(false)
  $("#open-user-list").addClass("hidden-medium-down")
  $("#open-settings").removeClass("hidden-medium-down")
}

function startInvite(network, channel) {
  $("#userlist-invite").remove()
  $("#userlist-list").loadTemplate($("#template-userlist-invite-box"), {}, {append: true, isFile: false, async: false})
  $("#userlist-invite-box").focus()
}

function stopInvite() {
  $("#userlist-invite-box").remove()
  $("#userlist-list").loadTemplate($("#template-userlist-invite"), {
  onclick: sprintf("startInvite('%s', '%s')", getActiveNetwork(), getActiveChannel())
  }, {append: true, isFile: false, async: false})
}

function finishInvite() {
  "use strict"
  sendMessage({
    type: "message",
    network: getActiveNetwork(),
    channel: getActiveChannel(),
    command: "invite",
    message: $("#userlist-invite-box").val()
  })
  stopInvite()
}

function isUserListHidden() {
  "use strict"
  return $("#userlist").hasClass("hidden")
}

function wasUserListHiddenManually() {
  "use strict"
  return $("#userlist").hasClass("hidden-manual")
}

function toggleUserList(manual) {
  "use strict"
  if ($("#userlist").hasClass("hidden")) {
    $("#userlist").removeClass("hidden")
    $("#userlist").removeClass("hidden-manual")
    $("#messaging").removeClass("messaging-userlisthidden")
  } else {
    $("#userlist").addClass("hidden")
    if(manual) $("#userlist").addClass("hidden-manual")
    $("#messaging").addClass("messaging-userlisthidden")
  }
}
