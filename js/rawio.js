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

"use strict"
function closeRawIO(event) {
  "use strict"
  if($(event.target).attr('id') !== "raw-io") {
    return
  }
  $("#raw-io").addClass("hidden")
  $("#raw-io > :not(.hidden)").addClass("hidden")
}

function openRawIO(network) {
  if (network.length === 0) {
    return
  }
  $("#raw-io").removeClass("hidden")
  $(sprintf("#raw-io-%s", network)).removeClass("hidden")
}

function createRawIO(network) {
  "use strict"
  $("#raw-io").loadTemplate($("#template-rawio"), {
    id_rawio: sprintf("raw-io-%s", network),
    id_rawout: sprintf("raw-output-%s", network),
    id_rawin: sprintf("raw-input-%s", network),
    id_rawin_field: sprintf("raw-input-field-%s", network),
    name: network
  }, {append: true, isFile: false, async: false})
}

function sendRaw() {
  "use strict"
  var io = $("#raw-io > :not(.hidden)")
  if (io.length === 0) {
    return
  }
  var net = io.attr("data-network-name")
  var field = $(sprintf("#raw-input-field-%s", net))
  sendMessage({
    type: "raw",
    network: io.attr("data-network-name"),
    message: field.val()
  })
  $(sprintf("#raw-output-%s", net)).append(sprintf("<div class='rawoutmsg rawownmsg'>--> %s</div>", field.val()))
  field.val("")
}
