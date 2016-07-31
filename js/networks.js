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

settings.networks = function(){}

settings.networks.openEditor = function() {
  "use strict"
  $("#settings-main").addClass("hidden")
  $("#settings-networks").removeClass("hidden")

  for (var name in data.getNetworks()) {
    var net = data.getNetworkIfExists(name)
    if (net !== undefined) {
      $("#network-list").loadTemplate($("#template-settings-list-entry"), {
        name: name,
        class: "btn network-list-button",
        onclick: sprintf("settings.networks.switch('%s')", name),
        id: sprintf("chnet-%s", name)
      }, {append: true, isFile: false, async: false})
    }
  }

}

settings.networks.closeEditor = function() {
  "use strict"
  $("#settings-main").removeClass("hidden")
  $("#settings-networks").addClass("hidden")
  $("#network-tool-save").unbind("click")
  $("#network-tool-delete").unbind("click")
}

settings.networks.switch = function(net) {
  "use strict"
  $("#network-list .new-net").remove()

  $("#network-tool-save").unbind("click")
  $("#network-tool-save").click(function() {
    settings.networks.save(net)
  })

  $("#network-tool-delete").unbind("click")
  $("#network-tool-delete").click(function() {
    settings.networks.delete(net)
  })

  $("#network-pane").attr("data-network", net)

  $(".network-list .selected-network").removeClass("selected-network")
  $(sprintf("#chnet-%s", net)).addClass("selected-network")

  var netData = data.getNetwork(net)
  $("#network-ed-name").attr("disabled", true)
  $("#network-ed-name").val(net)
  $("#network-ed-addr").val(netData.getIP())
  $("#network-ed-port").val(netData.getPort())
  $("#network-ed-ssl").attr("active", netData.usingSSL())
  $("#network-ed-connected").attr("active", netData.isConnected())
  $("#network-ed-user").val(netData.getUser())
  $("#network-ed-realname").val(netData.getRealname())
  $("#network-ed-nick").val(netData.getNick())
}

settings.networks.new = function() {
  var name = "newnet"
  $("#network-list").loadTemplate($("#template-settings-list-entry"), {
    name: name,
    class: "btn network-list-entry new-net",
    onclick: sprintf("settings.networks.switch('%s')", name),
    id: sprintf("chnet-%s", name)
  }, {append: true, isFile: false, async: false})

  settings.networks.switch(name)
}

settings.networks.delete = function(net) {
  $.ajax({
    type: "DELETE",
    url: sprintf("/network/%s/", net),
    success: function(data) {
      "use strict"
      dbg("Successfully deleted network", net)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      dbg("Failed to delete network", net + ":", textStatus, errorThrown)
      dbg(jqXHR)
    }
  })
}

settings.networks.save = function(net) {
  if ($(sprintf("#chnet-%s", net)).hasClass("new-net")) {
    net = $("#network-ed-name").val()
    $(sprintf("#chnet-%s", net)).removeClass("new-net")
    $.ajax({
      type: "POST",
      url: sprintf("/network/%s/", net),
      data: JSON.stringify({
        ip: $("#network-ed-addr").val(),
        port: $("#network-ed-port").val(),
        ssl: $("#network-ed-ssl").attr("active") === "true",
        user: $("#network-ed-user").val(),
        realname: $("#network-ed-realname").val(),
        nick: $("#network-ed-nick").val(),
      }),
      dataType: "json",
      success: function(data) {
        "use strict"
        dbg("Successfully created network", net)
        $.ajax({
          type: "POST",
          url: sprintf("/network/%s/", net),
          data: JSON.stringify({
            connected: $("#network-ed-connected").attr("active")
          })
        })
      },
      error: function(jqXHR, textStatus, errorThrown) {
        "use strict"
        dbg("Failed to create network", net + ":", textStatus, errorThrown)
        dbg(jqXHR)
      }
    })
  } else {
    $.ajax({
      type: "POST",
      url: sprintf("/network/%s/", net),
      data: JSON.stringify({
        name: $("#network-ed-name").val(),
        ip: $("#network-ed-addr").val(),
        port: $("#network-ed-port").val(),
        ssl: $("#network-ed-ssl").attr("active"),
        connected: $("#network-ed-connected").attr("active"),
        user: $("#network-ed-user").val(),
        realname: $("#network-ed-realname").val(),
        nick: $("#network-ed-nick").val(),
        forcedisconnect: false
      }),
      dataType: "json",
      success: function(data) {
        "use strict"
        dbg("Successfully updated network", net)
      },
      error: function(jqXHR, textStatus, errorThrown) {
        "use strict"
        dbg("Failed to update network", net + ":", textStatus, errorThrown)
        dbg(jqXHR)
      }
    })
  }
}
