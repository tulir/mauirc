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
      $("#userlist-list").append(sprintf('<a class="userlist-entry" href="#" onClick="openPM(\'%1$s\', \'%2$s\')" data-simplename="%2$s">%3$s</a>', getActiveNetwork(), ch.getUsersPlain()[i], val))
    })
    $("#open-user-list").removeClass("hidden-tablet-down")
    $("#open-settings").addClass("hidden-tablet-down")
    return
  }

  if (!isUserListHidden()) toggleUserList(false)
  $("#open-user-list").addClass("hidden-tablet-down")
  $("#open-settings").removeClass("hidden-tablet-down")
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
