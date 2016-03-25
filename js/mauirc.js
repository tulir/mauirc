function connect() {
  console.log("Connecting to socket...")
  socket = new WebSocket(websocketPath);
  
  socket.onopen = function() {
    if (!msgcontainer) {
      $("#container").loadTemplate($("#template-main"), {})

      $("#messages").loadTemplate($("#template-channel-messages"), {
        channel: "status-messages"
      }, {append: true, isFile: false, async: false})
      $("#channels").loadTemplate($("#template-channel-switcher"), {
        channel: "status-enter",
        channelname: "MauIRC Status",
        onclick: "switchTo('*mauirc')"
      }, {append: true, isFile: false, async: false})

      $("#status-messages").removeAttr("hidden")
      $("#status-enter").addClass("active")
      $("#message-text").focus()

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
    receive(data.id, data.network, data.channel, data.timestamp, data.sender, data.command, data.message, true)
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
      if (data == "true") {
        connect()
      } else {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      if(jqXHR.status == 401) {
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
      scrollDown()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      showAlert("error", "Failed to fetch history: " + textStatus + " " + errorThrown)
      scrollDown()
      console.log(jqXHR)
    }
  });
}
