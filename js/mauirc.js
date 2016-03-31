function connect() {
  console.log("Connecting to socket...")
  socket = new WebSocket(websocketPath);

  socket.onopen = function() {
    if (!msgcontainer) {
      $("#container").loadTemplate($("#template-main"), {})

      $("#messages").loadTemplate($("#template-channel"), {
        channel: "status-messages"
      }, {append: true, isFile: false, async: false})
      $("#networks").loadTemplate($("#template-channel-switcher"), {
        channel: "status-enter",
        channelname: "MauIRC Status",
        onclick: "switchTo('MauIRC Status', 'MauIRC Status')"
      }, {append: true, isFile: false, async: false})

      switchTo('MauIRC Status', 'MauIRC Status')

      history(1024)
      msgcontainer = true
    }

    showAlert("success", "<b>Connected to server.<b>")

    $('#message-send').removeAttr('disabled')
    $('#message-text').removeAttr('disabled')

    console.log("Connected!")
    connected = true
  };

  socket.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    if (data.type === "message") {
      receive(data.object.id, data.object.network, data.object.channel, data.object.timestamp,
        data.object.sender, data.object.command, data.object.message, true)
    } else if (data.type === "cmdresponse") {
      receiveCmdResponse(data.object.message)
    } else if (data.type === "chandata") {
      if (channelData[data.object.network] === undefined) {
        channelData[data.object.network] = {}
      }
      if (channelData[data.object.network]["*list"] === undefined) {
        channelData[data.object.network]["*list"] = []
      }

      channelData[data.object.network][data.object.name] = data.object

      if ($.inArray(data.object.name, channelData[data.object.network]["*list"]) === -1) {
        channelData[data.object.network]["*list"].push(data.object.name)
      }

      if (data.object.userlist !== null) {
        data.object.userlistplain = []
        data.object.userlist.forEach(function(val, i, arr) {
          let char = val.charAt(0)
          if (char === "~" || char === "&" || char === "@" || char === "%" || char === "+") {
            val = val.substring(1)
          }
          data.object.userlistplain.push(val)
        })
        updateUserList()
      }
    } else if (data.type === "nickchange") {
      console.log("Nick changed to " + data.object.nick + " on " + data.object.network)
      if (channelData[data.object.network] === undefined) {
        channelData[data.object.network] = {}
      }
      if (channelData[data.object.network]["*nick"] === undefined) {
        fixOwnMessages(data.object.network, data.object.nick)
      }
      channelData[data.object.network]["*nick"] = data.object.nick
    } else if (data.type === "netlist") {
      data.object.forEach(function(val, i, arr){
        openNetwork(val)
      })
    }
  };

  socket.onclose = function(evt) {
    if (evt.wasClean) {
      return
    }
    if (connected) {
      connected = false

      showAlert("error", "<b>Disconnected from server!</b>")
      scrollDown()
      $('#message-send').attr('disabled', true)
      $('#message-text').attr('disabled', true)

      console.log("Disconnected!")
    }
    if (!authfail) {
      setTimeout(reconnect, 2500)
    }
  };
}

function reconnect(){
  $.ajax({
    type: "GET",
    url: "/authcheck",
    success: function(data){
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
        setTimeout(reconnect, 5000)
      }
    }
  });
}

function history(n){
  $.ajax({
    type: "GET",
    url: "/history?n=" + n,
    dataType: "json",
    success: function(data){
      data.reverse().forEach(function(val, i, arr) {
        receive(val.id, val.network, val.channel, val.timestamp, val.sender, val.command, val.message, false)
      })
      for (var key in channelData) {
        if (!channelData.hasOwnProperty(key)) continue;

        if (channelData[key]["*nick"] !== undefined) {
          fixOwnMessages(key, channelData[key]["*nick"])
        }
      }
      scrollDown()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      showAlert("error", "Failed to fetch history: " + textStatus + " " + errorThrown)
      scrollDown()
      console.log(jqXHR)
    }
  });
}
