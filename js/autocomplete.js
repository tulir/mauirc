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

function commandAutocomplete(messagebox) {

}

function userAutocomplete(messagebox) {
  var text = messagebox.val().toLowerCase()
  var index = -1
  data.getChannel(getActiveNetwork(), getActiveChannel()).getUsersPlain().forEach(function(val, i, arr) {
    if(val.toLowerCase().startsWith(text)) {
      if (index !== -1) {
        index = -2
      } else {
        index = i
      }
    }
  })
  if (index > -1) {
    messagebox.val(data.getChannel(getActiveNetwork(), getActiveChannel()).getUsersPlain()[index] + ": ")
  }
}

function allAutocomplete() {
  var messagebox = $("#message-text")
  if (messagebox.val().startsWith("/")) {
    commandAutocomplete(messagebox)
  } else if (data.channelExists(getActiveNetwork(), getActiveChannel())) {
    userAutocomplete(messagebox)
  }
}
