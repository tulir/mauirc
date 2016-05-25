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
function DataStore() {
  "use strict"
  this.netlist = {},
  this.globalscripts = {},
  this.messageGroupDelay = 3,
  this.messageFormatting = true
}

DataStore.prototype.getMessageGroupDelay = function() {
  "use strict"
  return this.messageGroupDelay
}

DataStore.prototype.setMessageGroupDelay = function(delay) {
  "use strict"
  this.messageGroupDelay = delay
}

DataStore.prototype.getGlobalScript = function(name) {
  "use strict"
  if (this.scripts.hasOwnProperty(name)) {
    return this.scripts[name]
  } else {
    return undefined
  }
}

DataStore.prototype.putGlobalScript = function(name, script) {
  "use strict"
  this.scripts[name] = script
}

DataStore.prototype.getGlobalScripts = function() {
  "use strict"
  return this.scripts
}

DataStore.prototype.getNetwork = function(name) {
  "use strict"
  if (this.netlist.hasOwnProperty(name)) {
    return this.netlist[name]
  } else {
    var net = new NetworkStore()
    this.netlist[name] = net
    return net
  }
}

DataStore.prototype.getNetworkIfExists = function(name) {
  "use strict"
  if (this.netlist.hasOwnProperty(name)) {
    return net
  }
  return undefined
}

DataStore.prototype.networkExists = function(name) {
  "use strict"
  return this.netlist.hasOwnProperty(name)
}

DataStore.prototype.channelExists = function(network, channel) {
  "use strict"
  if (this.networkExists(network)) {
    if (this.netlist[network].channelExists(channel)) {
      return true
    }
  }
  return false
}

DataStore.prototype.getChannel = function(network, channel) {
  "use strict"
  return this.getNetwork(network).getChannel(channel)
}

DataStore.prototype.getChannelIfExists = function(network, channel) {
  "use strict"
  if (this.networkExists(network)) {
    return this.netlist[network].getChannelIfExists(channel)
  }
  return undefined
}

function NetworkStore() {
  this.chandata = {},
  this.chanlist = [],
  this.nick = "",
  this.connected = false,
  this.highlights = [],
  this.scripts = {}
}

NetworkStore.prototype.isConnected = function() {
  "use strict"
  return this.connected
}

NetworkStore.prototype.setConnected = function(connected) {
  "use strict"
  this.connected = connected
}

NetworkStore.prototype.getScript = function(name) {
  "use strict"
  if (this.scripts.hasOwnProperty(name)) {
    return this.scripts[name]
  } else {
    return undefined
  }
}

NetworkStore.prototype.putScript = function(name, script) {
  "use strict"
  this.scripts[name] = script
}

NetworkStore.prototype.getScripts = function() {
  "use strict"
  return this.scripts
}

NetworkStore.prototype.getChannels = function() {
  "use strict"
  return this.chanlist
}

NetworkStore.prototype.setChannels = function(channels) {
  "use strict"
  this.chanlist = channels
}

NetworkStore.prototype.getChannel = function(name) {
  "use strict"
  if (this.chandata.hasOwnProperty(name)) {
    return this.chandata[name]
  } else {
    var chan = new ChannelStore()
    this.chandata[name] = chan
    return chan
  }
}

NetworkStore.prototype.getChannelIfExists = function(name) {
  "use strict"
  if (this.chandata.hasOwnProperty(name)) {
    return this.chandata[name]
  }
  return undefined
}

NetworkStore.prototype.channelExists = function(name) {
  "use strict"
  return this.chandata.hasOwnProperty(name)
}

NetworkStore.prototype.getNick = function() {
  "use strict"
  return this.nick
}

NetworkStore.prototype.setNick = function(nick) {
  "use strict"
  this.nick = nick
}

NetworkStore.prototype.getHighlights = function() {
  "use strict"
  return this.highlights
}

NetworkStore.prototype.getHighlightsAsString = function() {
  "use strict"
  var str = ""
  this.highlights.forEach(function(val) {
  "use strict"
    str += val.toString().replace(",", "\\,") + ","
  })
  return str.slice(0, -1)
}

NetworkStore.prototype.setHighlights = function(highlights) {
  "use strict"
  this.highlights = highlights
}

NetworkStore.prototype.setHighlightsFromString = function(data) {
  "use strict"
  var highlights = [data]
  var minIndex = 0

  while(true) {
    var current = highlights.length - 1
    var str = highlights[current]
    var index = str.indexOf(",", minIndex)

    if (index === -1) {
      break
    } else if (index === 0) {
      highlights[current] = str.slice(1)
      minIndex = 1
      continue
    }

    if (str.charAt(index - 1) === "\\") {
      minIndex = index
      highlights[current] = str.slice(0, index - 1) + str.slice(index, str.length)
      continue
    } else if (index === str.length - 1) {
      highlights[current] = str.slice(0, str.length - 1)
      break
    }

    highlights[current] = str.slice(0, index)
    highlights.push(str.slice(index + 1, str.length))
    minIndex = 0
  }

  highlights.forEach(function(val, i) {
  "use strict"
    if(val.startsWith(":")) {
      highlights[i] = new Highlight("regex", val.slice(1))
    } else {
      highlights[i] = new Highlight("contains", val)
    }
  })
  this.highlights = highlights
}

function Highlight(type, value) {
  this.type = type,
  this.value = value
}

Highlight.prototype.matches = function(str) {
  "use strict"
  if(this.type === "regex") {
    var match = new RegExp(this.value.slice(1), "gi").exec(str)
    if (match !== null) {
      return {length: match[0].length+1, index: match.index-1}
    }
  } else {
    var match = str.toLowerCase().indexOf(this.value.toLowerCase())
    if(match !== -1) {
      return {length: this.value.length, index: match}
    }
  }
  return null
}

Highlight.prototype.toString = function() {
  "use strict"
  if(this.type === "regex") return ":" + this.value
  return this.value
}

function ChannelStore() {
  this.userlist = [],
  this.userlistPlain = [],
  this.topic = "",
  this.topicsetby = "",
  this.topicsetat = 0,
  this.notifications = "all",
  this.historyfetched = false
}

ChannelStore.prototype.isHistoryFetched = function() {
  "use strict"
  return this.historyfetched
}

ChannelStore.prototype.setHistoryFetched = function() {
  "use strict"
  this.historyfetched = true
}

ChannelStore.prototype.getUsers = function() {
  "use strict"
  return this.userlist
}

ChannelStore.prototype.getUsersPlain = function() {
  "use strict"
  return this.userlistPlain
}

ChannelStore.prototype.setUsers = function(users) {
  "use strict"
  if (isEmpty(users)) {
    this.userlist = []
    this.users = []
    return
  }
  this.userlist = users
  var plainlist = []
  users.forEach(function(val, i) {
  "use strict"
    var ch = val.charAt(0)
    if (ch === "~" || ch === "&" || ch === "@" || ch === "%" || ch === "+") {
      plainlist[i] = val.slice(1)
    } else {
      plainlist[i] = val
    }
  })
  this.userlistPlain = plainlist
}

ChannelStore.prototype.getTopic = function() {
  "use strict"
  return this.topic
}

ChannelStore.prototype.setTopic = function(topic) {
  "use strict"
  this.topic = topic
}

ChannelStore.prototype.getTopicSetAt = function() {
  "use strict"
  return this.topicsetat
}

ChannelStore.prototype.setTopicSetAt = function(setAt) {
  "use strict"
  this.topicsetat = setAt
}

ChannelStore.prototype.getTopicSetBy = function() {
  "use strict"
  return this.topicsetby
}

ChannelStore.prototype.setTopicSetBy = function(setBy) {
  "use strict"
  this.topicsetby = setBy
}

ChannelStore.prototype.setTopicFull = function(topic, setAt, setBy) {
  "use strict"
  this.topic = topic
  this.topicsetat = setAt
  this.topicsetby = setBy
}

ChannelStore.prototype.getNotificationLevel = function() {
  "use strict"
  return this.notifications
}

ChannelStore.prototype.setNotificationLevel = function(level) {
  "use strict"
  switch(level) {
  case "all":
  case 2:
    this.notifications = "all"
    break
  case "highlight":
  case "highlights":
  case 1:
    this.notifications = "highlight"
    break
  case "disabled":
  case "none":
  case "off":
  case 0:
    this.notifications = "disabled"
    break
  }
}
