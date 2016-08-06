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

// Package conn contains connection code
package conn

/* TODO implemet history
function history(network, channel, n) {
  var children = getChannel(network, channel).children(".message-wrapper")
  data.getChannel(network, channel).setFetchingHistory(true)
  "use strict"
  $.ajax({
    type: "GET",
    url: sprintf("/history/%s/%s/?n=%d", network, encodeURIComponent(channel), n),
    dataType: "json",
    success: function(histData) {
      "use strict"
      if (isEmpty(histData)) {
        return
      }
      children.remove()
      histData.reverse().forEach(function(val, i, arr) {
        receive(val.id, val.network, val.channel, val.timestamp, val.sender, val.command, val.message, val.ownmsg, val.preview, false)
      })
      var chanData = data.getChannel(network, channel)
      var msg = chanData.shiftCache()
      while (!isEmpty(msg)) {
        receive(msg.id, msg.network, msg.channel, msg.timestamp, msg.sender, msg.command, msg.message, msg.ownmsg, msg.preview, true)
        var msg = chanData.shiftCache()
      }
      chanData.setFetchingHistory(false)
      chanData.setHistoryFetched()
      scrollDown()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      data.getChannel(network, channel).setFetchingHistory(false)
      dbg(jqXHR)
      if(getActiveNetwork().length === 0 || getActiveChannel().length === 0) {
        return
      }
      getChannel(getActiveNetwork(), getActiveChannel()).loadTemplate($(sprintf("#template-error")), {
        message: sprintf("Failed to fetch history: %s %s", channel, network, textStatus, errorThrown)
      }, {isFile: false, async: false, append: true})
      scrollDown()
    }
  })
}
*/
