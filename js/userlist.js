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

function updateUserList(){
  if (channelData[getActiveNetwork()] !== undefined && channelData[getActiveNetwork()][getActiveChannel()] !== undefined
    && channelData[getActiveNetwork()][getActiveChannel()].userlist !== undefined) {
    if (isUserListHidden() && !wasUserListHiddenManually()) toggleUserList(false)

    $("#userlist-list").text("")
    channelData[getActiveNetwork()][getActiveChannel()].userlist.forEach(function(val, i, arr){
      $("#userlist-list").append(val + "<br>")
    })
    $("#open-user-list").removeClass("hidden-tablet-down")
    return
  }

  if (!isUserListHidden()) toggleUserList(false)
  $("#open-user-list").addClass("hidden-tablet-down")
}

function isUserListHidden() {
  return $("#userlist").hasClass("hidden")
}

function wasUserListHiddenManually() {
  return $("#userlist").hasClass("hidden-manual")
}

function toggleUserList(manual) {
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

function userAutocomplete(){
  if (channelData[getActiveNetwork()] !== undefined && channelData[getActiveNetwork()][getActiveChannel()] !== undefined &&
      channelData[getActiveNetwork()][getActiveChannel()].userlistplain !== undefined) {
    var list = channelData[getActiveNetwork()][getActiveChannel()].userlistplain
    var messagebox = $("#message-text")
    var text = messagebox.val().toLowerCase()
    var index = -1
    list.forEach(function(val, i, arr){
      if(val.toLowerCase().startsWith(text)) {
        if (index !== -1) {
          index = -2
        } else {
          index = i
        }
      }
    })
    if (index > -1) {
      messagebox.val(list[index] + ": ")
    }
  }
}
