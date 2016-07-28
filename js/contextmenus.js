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
  "use strict"
  $.contextMenu({
    selector: '.userlist-user-entry',
    callback: ctxUserList,
    items: {
      query: {name: "Open Query", icon: "query"},
      whois: {name: "Whois", icon: "whois"},
      op: {name: "Give OP", icon: "op"},
      deop: {name: "Take OP", icon: "deop"},
      kick: {name: "Kick", icon: "kick"},
      ban: {name: "Ban", icon: "ban"}
    }
  });

  $.contextMenu({
    selector: '.message',
    callback: ctxMessage,
    items: {
      delete: {name: "Delete Message", icon: "delete"},
      copy: {name: "Copy Text", icon: "copy"}
    }
  });

  $.contextMenu({
    selector: '.channel-switcher',
    callback: ctxChanSwitcher,
    items: {
      delete: {name: "Clear History", icon: "delete"},
      part: {name: "Part Channel", icon: "quit"}
    }
  });

  $.contextMenu({
    selector: '.network-switcher-name',
    callback: ctxNetSwitcher,
    items: {
      rawio: {name: "Raw IO", icon: "io"},
      oper: {name: "Oper Auth", icon: "op"},
      connect: {name: "Connect", icon: "connect"},
      disconnect: {name: "Disconnect", icon: "disconnect"},
      forcedisconnect: {name: "Force Disconnect", icon: "disconnect"}
    }
  });
});

function ctxNetSwitcher(key, options) {
  "use strict"
  if (key === "rawio") {
    openRawIO($(this).text())
  } else if (key === "oper") {
    openOper()
  } else if (key === "connect") {
    var net = $(this).text()
    $.ajax({
  		type: "POST",
  		url: sprintf("/network/%s/connect/", net),
  		success: function(data) {
        "use strict"
        dbg("Successfully connected to", net)
  		},
  		error: function(jqXHR, textStatus, errorThrown) {
        "use strict"
        if (jqXHR.status === 403) {
          dbg("Failed to connect to", net + ":", "Already connected")
        } else if (jqXHR.status == 500) {
          dbg("Failed to connect to", net + ":", "Server error")
        } else {
    			dbg("Failed to connect to", net + ":", jqXHR.status, errorThrown)
    			dbg(jqXHR)
        }
  		}
  	})
  } else if (key === "disconnect") {
    var net = $(this).text()
    $.ajax({
  		type: "POST",
  		url: sprintf("/network/%s/disconnect/", net),
  		success: function(data) {
        "use strict"
        dbg("Successfully connected to", net)
  		},
  		error: function(jqXHR, textStatus, errorThrown) {
        "use strict"
        if (jqXHR.status === 403) {
          dbg("Failed to disconnect from", net + ":", "Not connected")
        }/* else if (jqXHR.status == 500) {
          dbg("Failed to disconnect from", net + ":", "Server error")
        }*/ else {
    			dbg("Failed to disconnect from", net + ":", jqXHR.status, errorThrown)
    			dbg(jqXHR)
        }
  		}
  	})
  } else if (key === "forcedisconnect") {
    var net = $(this).text()
    $.ajax({
  		type: "POST",
  		url: sprintf("/network/%s/forcedisconnect/", net),
  		success: function(data) {
        "use strict"
        dbg("Successfully cut connection to", net)
  		},
  		error: function(jqXHR, textStatus, errorThrown) {
        "use strict"
        /*if (jqXHR.status === 403) {
          dbg("Failed to disconnect from", net + ":", "Not connected")
        } else if (jqXHR.status == 500) {
          dbg("Failed to disconnect from", net + ":", "Server error")
        } else {*/
    			dbg("Failed to disconnect from", net + ":", jqXHR.status, errorThrown)
    			dbg(jqXHR)
        //}
  		}
  	})
  }
}

function ctxUserList(key, options) {
  "use strict"
  if (key === "query") {
    $(this).click()
  } else if (key === "whois") {
    sendMessage({
      type: "message",
      network: getActiveNetwork(),
      channel: $(this).attr("data-simplename"),
      command: "whois",
      message: "whois"
    })
  } else if (key === "op") {
    sendMessage({
      type: "mode",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      message: sprintf("+o %s", $(this).attr("data-simplename"))
    })
  } else if (key === "deop") {
    sendMessage({
      type: "mode",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      message: sprintf("-o %s", $(this).attr("data-simplename"))
    })
  } else if (key === "kick") {
    sendMessage({
      type: "kick",
      network: getActiveNetwork(),
      channel: getActiveChannel(),
      user: $(this).attr("data-simplename"),
      message: "Get out"
    })
  }
}

function ctxMessage(key, options) {
  "use strict"
  if (key === "delete") {
    sendMessage({
      type: "delete",
      id: $(this).parent().attr("id").slice("msgwrap-".length),
    })
  } else if (key === "copy") {
    var element = $(this).find(".message-text")
    if (element.length === 0) {
      element = $(this).find(".clipboard-data")
      if (element.length === 0) {
        dbg("Clipboard data not found!")
        return
      }
    }
    var wasHidden = false
    if (element.hasClass("hidden")) {
      wasHidden = true
      element.removeClass("hidden")
    }
    var selection = window.getSelection()
    var range = document.createRange()
    range.selectNodeContents(element[0])
    selection.removeAllRanges()
    selection.addRange(range)
    document.execCommand("copy")
    selection.removeAllRanges()
    if (wasHidden) {
      element.addClass("hidden")
    }
  }
}

function ctxChanSwitcher(key, options) {
  "use strict"
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
}
