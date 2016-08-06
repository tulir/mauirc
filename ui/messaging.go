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

// Package ui contains UI-related functions
package ui

import (
	"fmt"
	"github.com/gopherjs/gopherjs/js"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util"
	"strings"
)

// Send messages
func Send() {
	if !data.Connected {
		fmt.Println("Tried to send message without connection!")
		return
	}

	msg := jq("#message-text").Val()
	if len(msg) == 0 {
		return
	}

	var obj messages.Message
	if msg[0] == '/' {
		args := strings.Split(msg, " ")
		cmd := strings.ToLower(args[0][1:])
		switch cmd {
		case "me":
			obj = messages.Message{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				Command: "action",
				Message: strings.Join(args, " "),
			}
		case "topic":
			fallthrough
		case "title":
			obj = messages.Message{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				Command: "topic",
				Message: strings.Join(args, " "),
			}
		case "nick":
			fallthrough
		case "name":
			fallthrough
		case "nickname":
			obj = messages.Message{
				Network: GetActiveNetwork(),
				Channel: GetActiveChannel(),
				Command: "nick",
				Message: strings.Join(args, " "),
			}
		case "msg":
			fallthrough
		case "message":
			fallthrough
		case "query":
			fallthrough
		case "q":
			fallthrough
		case "privmsg":
			if len(args) > 1 {
				obj = messages.Message{
					Network: GetActiveNetwork(),
					Channel: args[0],
					Command: "privmsg",
					Message: strings.Join(args[1:], " "),
				}
			}
		case "join":
			if len(args) > 0 {
				obj = messages.Message{
					Network: GetActiveNetwork(),
					Channel: args[0],
					Command: "action",
					Message: "Joining",
				}
			}
		case "part":
			fallthrough
		case "leave":
			fallthrough
		case "quit":
			fallthrough
		case "exit":
			obj = messages.Message{
				Network: GetActiveNetwork(),
				Channel: args[0],
				Command: "part",
				Message: "Leaving",
			}
		default:
			templates.AppendObj("error", GetActiveChannelObj(), "Unknown command: "+cmd)
			ScrollDown()
			jq("#message-text").SetVal("")
			return
		}
	} else {
		obj = messages.Message{
			Network: GetActiveNetwork(),
			Channel: GetActiveChannel(),
			Command: "privmsg",
			Message: util.EncodeMessage(msg),
		}
	}

	data.Messages <- messages.Container{
		Type:   messages.MsgMessage,
		Object: obj,
	}
	jq("#message-text").SetVal("")
}

// Receive messages
func Receive(msg messages.Message, isNew bool) {
	net := GetNetwork(msg.Network)
	if net.Length == 0 {
		if msg.Command == "part" && msg.Sender == data.Networks.MustGet(msg.Network).Nick {
			return
		}

		OpenNetwork(msg.Network)
		net = GetNetwork(msg.Network)
	}

	ch := GetChannel(msg.Network, msg.Channel)
	if ch.Length == 0 {
		if msg.Command == "part" && msg.Sender == data.Networks.MustGet(msg.Network).Nick {
			return
		}

		OpenChannel(msg.Network, msg.Channel, false)
		ch = GetChannel(msg.Network, msg.Channel)
	}

	/* TODO finish implementation. Original JS:
	   var templateData = {
	     sender: sender,
	     date: moment(timestamp * 1000).format("HH:mm:ss"),
	     id: sprintf("msg-%d", id),
	     wrapid: sprintf("msgwrap-%d", id),
	     message: linkifyHtml(escapeHtml(message)),
	     timestamp: timestamp
	   }

	   if (command === "action") {
	     templateData.prefix = "<b>★</b> "
	     templateData.class = "user-action"
	     templateData.clipboard = sprintf("* %s %s", sender, message)
	   } else if (command === "join" || command === "part" || command === "quit") {
	     templateData.message = (command === "join" ? "joined " : "left: ") + templateData.message
	     templateData.class = "secondary-action joinpart"
	     templateData.clipboard = sprintf("%s %s %s", sender, command === "join" ? "joined" : "left:", message)
	   } else if (command === "kick") {
	     var index = message.indexOf(":")
	     var kicker = templateData.sender
	     sender = message.substr(0, index)
	     message = message.substr(index + 1)
	     templateData.sender = sender
	     templateData.message = sprintf("was kicked by <b>%s</b>: <b>%s</b>", kicker, linkifyHtml(escapeHtml(message)))
	     templateData.class = "secondary-action kick"
	     templateData.clipboard = sprintf("%s was kicked by %s: %s", sender, kicker, message)
	   } else if (command === "mode") {
	     var parts = message.split(" ")
	     if (parts.length > 1) {
	       templateData.message = sprintf("set mode <b>%s</b> for <b>%s</b>", parts[0], parts[1])
	       templateData.clipboard = sprintf("set mode %s for %s", parts[0], parts[1])
	     } else {
	       templateData.message = sprintf("set channel mode <b>%s</b>", parts[0])
	       templateData.clipboard = sprintf("set channel mode %s", parts[0])
	     }
	     templateData.class = "secondary-action modechange"
	   } else if (command === "nick") {
	     templateData.message = sprintf("is now known as <b>%s</b>", message)
	     templateData.class = "secondary-action nickchange"
	     templateData.clipboard = sprintf("%s is now known as %s", sender, message)
	   } else if (command == "topic") {
	     templateData.message = sprintf("changed the topic to <b>%s</b>", message)
	     templateData.class = "secondary-action topicchange"
	     templateData.clipboard = sprintf("%s changed the topic to %s", sender, message)
	   } else {
	     var template = "message"
	     var join = tryJoinMessage(id, network, channel, timestamp, sender, command, templateData.message, ownmsg)
	   }

	   templateData.wrapclass = "message-wrapper" + (ownmsg ? " own-message-wrapper" : "") + (join ? " message-joined" : "")
	   templateData.class = "message " + (!isEmpty(templateData.class) ? templateData.class : "") + (ownmsg ? " own-message" : "")
	   templateData.message = decodeMessage(templateData.message)

	   if (template === undefined) {
	     var template = "action"
	   }

	   if($(sprintf("#msgwrap-%d", id)).length !== 0) {
	     var loadedTempl = $("<div></div>").loadTemplate($(sprintf("#template-%s", template)), templateData, {append: true, isFile: false, async: false})
	     $(sprintf("#msgwrap-%d", id)).replaceWith(loadedTempl.children(":first"))
	   } else {
	     chanObj.loadTemplate($(sprintf("#template-%s", template)), templateData, {append: true, isFile: false, async: false})
	   }

	   if (ownmsg || join) {
	     $(sprintf("#msg-%d > .message-sender", id)).remove()
	   }
	   var msgObj = $(sprintf("#msg-%d", id))
	   if (preview !== null) {
	     if (!isEmpty(preview.image) && !isEmpty(preview.text)) {
	       var pwTemplate = "both"
	     } else if (!isEmpty(preview.image)) {
	       var pwTemplate = "image"
	     } else if (!isEmpty(preview.text)) {
	       var pwTemplate = "text"
	     }
	     if (pwTemplate !== undefined) {
	       msgObj.loadTemplate($(sprintf("#template-message-preview-%s", pwTemplate)), {
	         title: preview.text !== undefined ? preview.text.title : "",
	         description: preview.text !== undefined && preview.text.description !== undefined ? preview.text.description.replaceAll("\n", "<br>") : "",
	         sitename: preview.text !== undefined ? preview.text.sitename : "",
	         image: preview.image !== undefined ? preview.image.url : "",
	         modalopen: sprintf("openFullImageModal('%d')", id)
	       }, {append: true, isFile: false, async: false})
	     }
	   }

	   var match = getHighlights(data.getNetwork(network), templateData.message)

	   if (template === "message" && match !== null) {
	     msgObj.find(".message-text").html(sprintf('%s<span class="highlighted-text">%s</span>%s',
	       templateData.message.slice(0, match.index),
	       templateData.message.slice(match.index, match.index + match.length),
	       templateData.message.slice(match.index + match.length)
	     ))
	     msgObj.addClass("highlight")
	   }

	   if (isNew) {
	     notifyMessage(network, channel, match !== null, sender, message)
	   }
	 }*/
}

// GetHighlight gets the first highlight match
func GetHighlight(network, message string) *data.HighlightMatch {
	netData := data.Networks.MustGet(network)
	for _, hl := range netData.Highlights {
		match := hl.Match(message)
		if match != nil {
			return match
		}
	}
	return nil
}

// NotifyMessage shows necessary notifications
func NotifyMessage(network, channel, sender, message string, highlight bool) {
	message = util.RemoveFormatChars(message)

	notifs := data.NotificationAll
	ch := data.Networks.GetChannel(network, channel)
	if ch != nil {
		notifs = ch.Notifications
	}

	hide := GetChannel(network, channel).HasClass("hidden")
	if (notifs == data.NotificationAll || (notifs == data.NotificationHighlights && highlight)) && !js.Global.Get("document").Call("hasFocus").Bool() {
		// TODO send notification
		fmt.Println(message)
		if hide {
			jq(fmt.Sprintf("#switchto-%s-%s", NetworkFilter(network), ChannelFilter(channel))).AddClass("new-messages")
		}
	}

	if !hide {
		ScrollDown()
	}
}

// TryJoinMessage tries to join the message with the one above
func TryJoinMessage(msg messages.Message) bool {
	chanObj := GetChannel(msg.Network, msg.Channel)
	if chanObj.Length == 0 {
		return false
	}

	prevMsg := chanObj.Children(".message-wrapper:last")
	if prevMsg.Length == 0 {
		return false
	}

	if prevMsg.Attr("sender") != msg.Sender {
		return false
	}

	prevMsg.AddClass("message-joined-prev")
	return true
}

// OpenFullImageModal ...
func OpenFullImageModal(id int64) {
	templates.Apply("image-modal", "#modal", map[string]interface{}{
		"ID":     id,
		"Source": jq(fmt.Sprintf("#msg-%d > .message-preview", id)).Find(".preview-image-link > .preview-image").Attr("stc"),
	})
	ShowModal()
}
