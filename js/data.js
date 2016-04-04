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

function DataStore(){
  this.netlist = {}
}

DataStore.prototype.getNetwork = function(name) {
  if (this.netlist.hasOwnProperty(name)) {
    return this.netlist[name]
  } else {
    var net = new NetworkStore()
    this.netlist[name] = net
    return net
  }
}

DataStore.prototype.getNetworkIfExists = function(name) {
  if (this.netlist.hasOwnProperty(name)) {
    return net
  }
  return undefined
}

DataStore.prototype.networkExists = function(name) {
  return this.netlist.hasOwnProperty(name)
}

DataStore.prototype.channelExists = function(network, channel) {
  if (this.networkExists(network)) {
    if (this.netlist[network].channelExists(channel)) {
      return true
    }
  }
  return false
}

DataStore.prototype.getChannel = function(network, channel) {
  return this.getNetwork(network).getChannel(channel)
}

DataStore.prototype.getChannelIfExists = function(network, channel) {
  if (this.networkExists(network)) {
    return this.netlist[network].getChannelIfExists(channel)
  }
  return undefined
}

function NetworkStore(){
  this.chandata = {},
  this.chanlist = [],
  this.nick = "",
  this.highlights = []
}

NetworkStore.prototype.getChannels = function(){
  return this.chanlist
}

NetworkStore.prototype.setChannels = function(channels) {
  this.chanlist = channels
}

NetworkStore.prototype.getChannel = function(name) {
  if (this.chandata.hasOwnProperty(name)) {
    return this.chandata[name]
  } else {
    var chan = new ChannelStore()
    this.chandata[name] = chan
    return chan
  }
}

NetworkStore.prototype.getChannelIfExists = function(name) {
  if (this.chandata.hasOwnProperty(name)) {
    return this.chandata[name]
  }
  return undefined
}

NetworkStore.prototype.channelExists = function(name) {
  this.chandata.hasOwnProperty(name)
}

NetworkStore.prototype.getNick = function() {
  return this.nick
}

NetworkStore.prototype.setNick = function(nick) {
  this.nick = nick
}

NetworkStore.prototype.getHighlights = function() {
  return this.highlights
}

NetworkStore.prototype.getHighlightsAsString = function() {
  var str = ""
  this.highlights.forEach(function(val){
    str += val.toString().replace(",", "\\,") + ","
  })
  return str.slice(0, -1)
}

NetworkStore.prototype.setHighlights = function(highlights) {
  this.highlights = highlights
}

NetworkStore.prototype.setHighlightsFromString = function(data) {
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

  highlights.forEach(function(val, i){
    if(val.startsWith(":")) {
      this.highlights[i] = new Highlight("regex", val.slice(1))
    } else {
      this.highlights[i] = new Highlight("contains", val)
    }
  })
}

function Highlight(type, value){
  this.type = type,
  this.value = value
}

Highlight.prototype.matches = function(str) {
  if(this.type === "regex") {
    var match = new RegExp(this.value.slice(1), "gi").exec(str)
    if (match !== null) {
      return {length: match[0].length, index: match.index}
    }
  } else {
    var match = str.toLowerCase().indexOf(val.toLowerCase())
    if(match !== -1) {
      return {length: this.value.length, index: match}
    }
  }
  return null
}

Highlight.prototype.toString = function() {
  if(this.type === "regex") return ":" + this.value
  return this.value
}

function ChannelStore(){
  this.userlist = [],
  this.userlistPlain = [],
  this.topic = "",
  this.topicsetby = "",
  this.topicsetat = 0,
  this.notifications = "all"
}

ChannelStore.prototype.getUsers = function() {
  return this.userlist
}

ChannelStore.prototype.getUsersPlain = function() {
  return this.userlistPlain
}

ChannelStore.prototype.setUsers = function(users) {
  this.userlist = users
  var plainlist = []
  users.forEach(function(val, i){
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
  return this.topic
}

ChannelStore.prototype.setTopic = function(topic) {
  this.topic = topic
}

ChannelStore.prototype.getTopicSetAt = function() {
  return this.topicsetat
}

ChannelStore.prototype.setTopicSetAt = function(setAt) {
  this.topicsetat = setAt
}

ChannelStore.prototype.getTopicSetBy = function() {
  return this.topicsetby
}

ChannelStore.prototype.setTopicSetBy = function(setBy) {
  this.topicsetby = setBy
}

ChannelStore.prototype.setTopicFull = function(topic, setAt, setBy) {
  this.topic = topic
  this.topicsetat = setAt
  this.topicsetby = setBy
}

ChannelStore.prototype.getNotificationLevel = function() {
  return this.notifications
}

ChannelStore.prototype.setNotificationLevel = function(level) {
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
