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
        class: "btn network-list-entry",
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
}

settings.networks.switch = function(net) {
  "use strict"
  var netData = data.getNetwork(net)
  $("#network-pane").attr("data-network", net)
  $("#network-ed-name").val(net)
  $("#network-ed-addr").val(netData.getIP())
  $("#network-ed-port").val(netData.getPort())
  $("#network-ed-ssl").attr("active", netData.usingSSL())
  $("#network-ed-user").val(netData.getUser())
  $("#network-ed-realname").val(netData.getRealname())
  $("#network-ed-nick").val(netData.getNick())
}
