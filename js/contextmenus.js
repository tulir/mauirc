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

$(function() {
  $.contextMenu({
    selector: '.message',
    callback: function(key, options) {
      if (key === "delete") {
        sendMessage({
          type: "delete",
          id: $(this).parent().attr("id").slice("msgwrap-".length),
        })
      }
    },
    items: {
      delete: {name: "Delete", icon: "delete"}
    }
  });

  $.contextMenu({
    selector: '.channel-switcher',
    callback: function(key, options) {
      var idPieces = $(this).attr("id").split("-")

      if (key === "delete") {
        sendMessage({
          type: "clear",
          network: idPieces[1],
          channel: idPieces[2]
        })
      } else if (key === "part") {
        if(idPieces[2].startsWith("#")) {
          sendMessage({
            type: "message",
            network: idPieces[1],
            channel: idPieces[2],
            command: "part",
            message: "Leaving"
          })
        } else {
          sendMessage({
            type: "close",
            network: idPieces[1],
            channel: idPieces[2]
          })
        }
        closeChannel(idPieces[1], idPieces[2])
      }
    },
    items: {
      delete: {name: "Clear History", icon: "delete"},
      part: {name: "Part Channel", icon: "quit"}
    }
  });
});
