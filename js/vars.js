var socket = null
var connected = false
var authfail = false
var msgcontainer = false

var websocketPath = 'wss://' + window.location.host + '/socket'
if (window.location.protocol != "https:") {
  websocketPath = 'ws://' + window.location.host + '/socket'
}
