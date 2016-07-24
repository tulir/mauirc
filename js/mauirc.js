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

function connect() {
  "use strict"
  dbg("Connecting to socket...")
  socket = new WebSocket(websocketPath)

  socket.onopen = function() {
    "use strict"
    if (!msgcontainer) {
      $("#container").loadTemplate($("#template-main"), {append: false, isFile: false, async: false})
      $("#settings").loadTemplate($("#template-settings"), {append: false, isFile: false, async: false})

      msgcontainer = true
    }

    $("#disconnected").addClass("hidden")

    connected = true
  }

  socket.onmessage = function (evt) {
    "use strict"
    var ed = JSON.parse(evt.data)
    if (ed.type === "message") {
      receive(ed.object.id, ed.object.network, ed.object.channel, ed.object.timestamp,
        ed.object.sender, ed.object.command, ed.object.message, ed.object.ownmsg,
        ed.object.preview, true)
    } else if (ed.type === "cmdresponse") {
      receiveCmdResponse(ed.object.message)
    } else if (ed.type === "chandata") {
      var channel = data.getChannel(ed.object.network, ed.object.name)
      channel.setTopicFull(ed.object.topic, ed.object.topicsetat, ed.object.topicsetby)
      channel.setUsers(ed.object.userlist)
      channel.setNotificationLevel("all")
      openChannel(ed.object.network, ed.object.name, false)

      if(getActiveNetwork() === ed.object.network && getActiveChannel() === ed.object.name) {
        $("#title").text(ed.object.topic)
        updateUserList()
      }
    } else if (ed.type === "nickchange") {
      dbg("Nick changed to", ed.object.nick, "on", ed.object.network)
      data.getNetwork(ed.object.network).setNick(ed.object.nick)
    } else if (ed.type === "netdata") {
      openNetwork(ed.object.name)
      data.getNetwork(ed.object.name).setConnected(ed.object.connected)
      if(ed.object.connected) {
        $(sprintf("#switchnet-%s", ed.object.name)).removeClass("disconnected")
      } else {
        $(sprintf("#switchnet-%s", ed.object.name)).addClass("disconnected")
      }

      $.ajax({
        type: "GET",
        url: "/script/" + ed.object.name,
        dataType: "json",
        success: function(scripts) {
          "use strict"
          if (isEmpty(scripts)) return
          var net = data.getNetwork(ed.object.name)
          scripts.forEach(function(val, i, arr) {
            net.putScript(val.name, val.script)
          })
        },
        error: function(jqXHR, textStatus, errorThrown) {
          "use strict"
          dbg("Failed to get scripts of", ed.object.name + ":", textStatus, errorThrown)
          dbg(jqXHR)
        }
      })
    } else if (ed.type === "chanlist") {
      data.getNetwork(ed.object.network).setChannels(ed.object.list)
    } else if (ed.type === "clear") {
      $(sprintf("#chan-%s-%s", ed.object.network, channelFilter(ed.object.channel))).html("")
    } else if (ed.type === "delete") {
      $(sprintf("#msgwrap-%s", ed.object)).remove()
    } else if (ed.type === "whois") {
      dbg(ed.object)
    } else if (ed.type === "invite") {
      /*$("#modal-container").loadTemplate($("#template-invite"), {
        sender: ed.object.sender,
        channel: ed.object.channel,
        accept: sprintf("acceptInvite('%s', '%s')", ed.object.network, ed.object.channel)
      }, {append: false, isFile: false, async: false})
      $("#modal-container").modal()*/
    } else if (ed.type === "raw") {
      $(sprintf("#raw-output-%s", ed.object.network)).append(sprintf("<div class='rawoutmsg'>%s</div>", ed.object.message))
    }
  }

  socket.onclose = function(evt) {
    "use strict"
    if (evt.wasClean) {
      return
    }
    if (connected) {
      connected = false

      $("#disconnected").removeClass("hidden")
    }
    if (!authfail) {
      timeout = setTimeout(reconnect, 20000)
    }
  }
}

function acceptInvite(net, chan) {
  closeInvite()
  sendMessage({
    type: 'message',
    network: net,
    channel: chan,
    command: 'join',
    message: 'Joining'
  })
}

function tryReconnect() {
  "use strict"
  clearTimeout(timeout)
  $("#try-reconnect").attr("disabled", true)
  setTimeout(function(){
    $("#try-reconnect").removeAttr("disabled")
  }, 3000)
  reconnect()
}

function reconnect() {
  "use strict"
  $.ajax({
    type: "GET",
    url: "/auth/check",
    success: function(data) {
      if (data === "true") {
        connect()
      } else {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      if(jqXHR.status === 401) {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      } else {
        timeout = setTimeout(reconnect, 20000)
      }
    }
  })
}

function history(network, channel, n) {
  "use strict"
  $.ajax({
    type: "GET",
    url: sprintf("/history/%s/%s/?n=%d", network, encodeURIComponent(channel), n),
    dataType: "json",
    success: function(data) {
      "use strict"
      if (isEmpty(data)) {
        return
      }
      data.forEach(function(val, i, arr) {
        receive(val.id, val.network, val.channel, val.timestamp, val.sender, val.command, val.message, val.ownmsg, val.preview, false)
      })
      scrollDown()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      dbg(jqXHR)
      if(getActiveNetwork().length === 0 || getActiveChannel().length === 0) {
        return
      }
      $(sprintf("#chan-%s-%s", getActiveNetwork(), getActiveChannel())).loadTemplate($(sprintf("#template-error")), {
        message: sprintf("Failed to fetch history: %s %s", channel, network, textStatus, errorThrown)
      }, {isFile: false, async: false, append: true})
      scrollDown()
    }
  })
}
