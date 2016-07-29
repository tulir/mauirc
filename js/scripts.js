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

function snOpenScriptEditor(net, scripts) {
  "use strict"
  $("#settings-main").addClass("hidden")
  $("#settings-networkeditor").addClass("hidden")
  $("#settings-scripts").removeClass("hidden")

  scripteditor = ace.edit("script-editor")
  scripteditor.setOptions({
    fontFamily: "Fira Code",
    fontSize: "11pt"
  })
  scripteditor.setShowPrintMargin(false)
  scripteditor.setTheme("ace/theme/chrome")
  scripteditor.getSession().setMode("ace/mode/golang")
  scripteditor.getSession().setUseWorker(false)
  scripteditor.getSession().setUseWrapMode(true)
  scripteditor.getSession().setUseSoftTabs(true)

  scripteditor.commands.addCommand({
      name: 'save',
      bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
      exec: function(editor) {
        snSaveScript()
      },
      readOnly: false
  })

  $("#script-list").empty()
  for (var key in scripts) {
    if (scripts.hasOwnProperty(key)) {
      $("#script-list").loadTemplate($("#template-script-list-entry"), {
        id: sprintf("chscript-%s", key),
        name: key,
        network: net,
        onclick: sprintf("snSwitchScript('%s', '%s')", net, key)
      }, {append: true, isFile: false, async: false})
    }
  }

  $("#script-tool-new").unbind("click")
  $("#script-tool-new").click(function() {
    snNewScript(net)
  })
}

function snCloseScriptEditor() {
  "use strict"
  $("#settings-main").removeClass("hidden")
  $("#settings-networkeditor").addClass("hidden")
  $("#settings-scripts").addClass("hidden")
}

function snSwitchScript(net, name) {
  "use strict"
  var script
  if (net === "global") {
    script = data.getGlobalScript(name)
  } else {
    script = data.getNetwork(net).getScript(name)
  }
  if (script === undefined) {
    dbg("Script not found:", name, "@", net)
    return
  }
  $("#script-list > .selected-script").removeClass("selected-script")
  $(sprintf("#chscript-%s", name)).addClass("selected-script")

  scripteditor.setValue(script, 1)
  $("#script-name").val(name)

  $("#script-tool-delete").unbind("click")
  $("#script-tool-delete").click(function() {
    snDeleteScript(net, name)
  })

  $("#script-tool-save").unbind("click")
  $("#script-tool-save").click(function() {
    snUploadScript(net, name)
  })

  $("#script-tool-rename").unbind("click")
  $("#script-tool-rename").click(function() {
    snRenameScript(net, name)
  })
}

function snSaveScript() {
  "use strict"
  var script = scripteditor.getValue()
  var name = $("#script-list > .selected-script").attr("data-name")
  var net = $("#script-list > .selected-script").attr("data-network")
  if (net === "global") {
    data.putGlobalScript(name, script)
  } else {
    data.getNetwork(net).putScript(name, script)
  }
}

function snNewScript(net) {
  "use strict"
  var key = "new-script"
  $("#script-list").loadTemplate($("#template-script-list-entry"), {
    id: sprintf("chscript-%s", key),
    name: key,
    network: net,
    onclick: sprintf("snSwitchScript('%s', '%s')", net, key)
  }, {append: true, isFile: false, async: false})

  if (net === "global") {
    data.putGlobalScript(key, "")
  } else {
    data.getNetwork(net).putScript(key, "")
  }

  snSwitchScript(net, key)
  snUploadScript(net, key)
}

function snUploadScript(net, name) {
  "use strict"
  snSaveScript()

  if (net === "global") {
    var script = data.getGlobalScript(name)
  } else {
    var script = data.getNetwork(net).getScript(name)
  }

  $.ajax({
    type: "PUT",
    url: sprintf("/script/%s/%s/", net, name),
    data: script,
    success: function(data) {
      "use strict"
      dbg("Successfully updated script", name, "@", net)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      dbg("Failed to update script", name, "@", net + ":", textStatus, errorThrown)
      dbg(jqXHR)
    }
  })
}

function snRenameScript(net, name) {
  "use strict"
  var newName = $("#script-name").val()
  $.ajax({
    type: "POST",
    url: sprintf("/script/%s/%s/", net, name),
    data: sprintf("%s,%s", net, newName),
    success: function() {
      "use strict"
      dbg("Successfully renamed script", name, "@", net, "to", newName)
      if(net === "global") {
        var script = data.getGlobalScript(name)
        data.deleteGlobalScript(name)
        data.putGlobalScript(newName, script)
        snOpenScriptEditor(net, data.getGlobalScripts())
      } else {
        var netw = data.getNetwork(net)
        var script = netw.getScript(name)
        netw.deleteScript(name)
        netw.putScript(newName, script)
        snOpenScriptEditor(net, netw.getScripts())
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      dbg("Failed to rename script", name, "@", net, "to", newName + ":", textStatus, errorThrown)
      dbg(jqXHR)
    }
  })
}

function snDeleteScript(net, name) {
  "use strict"
  $.ajax({
    type: "DELETE",
    url: sprintf("/script/%s/%s/", net, name),
    success: function() {
      "use strict"
      dbg("Successfully deleted script", name, "@", net)
      if (net === "global") {
        data.deleteGlobalScript(name)
        snOpenScriptEditor(net, data.getGlobalScripts())
      } else {
        var netw = data.getNetwork(net)
        netw.deleteScript(name)
        snOpenScriptEditor(net, netw.getScripts())
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      dbg("Failed to delete script", name, "@", net + ":", textStatus, errorThrown)
      dbg(jqXHR)
    }
  })
}

function snEditScripts() {
  "use strict"
  snOpenScriptEditor(getActiveNetwork(), data.getNetwork(getActiveNetwork()).getScripts())
}

function snEditGlobalScripts() {
  "use strict"
  snOpenScriptEditor("global", data.getGlobalScripts())
}

function updateScripts(net, reload) {
  "use strict"
  dbg("Loading scripts for", net)
  $.ajax({
    type: "GET",
    url: "/script/" + net,
    dataType: "json",
    success: function(scripts) {
      "use strict"
      if (isEmpty(scripts)) return
      if (net === "global") {
        scripts.forEach(function(val, i, arr) {
          data.putGlobalScript(val.name, val.script)
        })

        if (reload) {
          snEditGlobalScripts()
        }
      } else {
        var netw = data.getNetwork(net)
        scripts.forEach(function(val, i, arr) {
          netw.putScript(val.name, val.script)
        })

        if (reload) {
          snEditScripts()
        }
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      "use strict"
      dbg("Failed to get scripts of", net + ":", textStatus, errorThrown)
      dbg(jqXHR)
    }
  })
}
