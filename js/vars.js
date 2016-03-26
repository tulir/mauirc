var socket = null
var connected = false
var authfail = false
var msgcontainer = false
var channelData = {}

channelData["MauIRC Status"] = {
  userlist: [],
  topic: "MauIRC status messages",
  topicsetby: "tulir293",
  topicsetat: 1
}

var websocketPath = 'wss://' + window.location.host + '/socket'
if (window.location.protocol != "https:") {
  websocketPath = 'ws://' + window.location.host + '/socket'
}
