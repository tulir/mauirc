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
	"github.com/sorcix/irc"
	"html"
	"maunium.net/go/mauirc-common/messages"
	"maunium.net/go/mauirc/data"
	"maunium.net/go/mauirc/templates"
	"maunium.net/go/mauirc/util"
	"maunium.net/go/mauirc/util/console"
	"strings"
	"time"
)

// Send messages
func Send() {
	if !data.Connected {
		console.Warn("Tried to send message without connection!")
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
		args = args[1:]
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
				Command: irc.TOPIC,
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
				Command: irc.NICK,
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
				net := GetActiveNetwork()
				ch := args[0]
				if len(args) > 0 {
					net = args[0]
				}
				obj = messages.Message{
					Network: net,
					Channel: ch,
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
			net := GetActiveNetwork()
			ch := GetActiveChannel()
			if len(args) > 0 {
				ch = args[0]
				if len(args) > 1 {
					net = args[1]
				}
			}
			obj = messages.Message{
				Network: net,
				Channel: ch,
				Command: irc.PART,
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

// MessageTemplateData contains things
type MessageTemplateData struct {
	Sender    string
	Date      string
	DateFull  string
	Message   string
	class     []string
	wrapClass []string
	Class     string
	WrapClass string
	Clipboard string
	OwnMsg    bool
	Joined    bool
	IsAction  bool
	ID        int64
	Timestamp int64
	Preview   PreviewTemplateData
}

// PreviewTemplateData contains more things
type PreviewTemplateData struct {
	PreviewImage bool
	PreviewText  bool
	Image        string
	Title        string
	Sitename     string
	Description  string
	ID           int64
}

// Receive messages
func Receive(msg messages.Message, isNew bool) {
	net := GetNetwork(msg.Network)
	if net.Length == 0 {
		if msg.Command == irc.PART && msg.Sender == data.MustGetNetwork(msg.Network).Nick {
			return
		}

		OpenNetwork(msg.Network)
		net = GetNetwork(msg.Network)
	}

	ch := GetChannel(msg.Network, msg.Channel)
	if ch.Length == 0 {
		if msg.Command == irc.PART && msg.Sender == data.MustGetNetwork(msg.Network).Nick {
			return
		}

		OpenChannel(msg.Network, msg.Channel, false)
		ch = GetChannel(msg.Network, msg.Channel)
	}

	templateData := MessageTemplateData{
		Sender:    msg.Sender,
		Date:      time.Unix(msg.Timestamp, 0).Format("15:04:05"),
		DateFull:  time.Unix(msg.Timestamp, 0).Format("Monday, 2 Jan 2006 (MST)"),
		ID:        msg.ID,
		class:     []string{"message"},
		wrapClass: []string{"message-wrapper"},
		OwnMsg:    msg.OwnMsg,
		Joined:    TryJoinMessage(msg),
		Message:   util.Linkify(html.EscapeString(msg.Message)),
		Clipboard: msg.Message,
		Timestamp: msg.Timestamp,
		IsAction:  true,
		Preview:   PreviewTemplateData{},
	}

	if msg.Preview != nil {
		templateData.Preview.ID = msg.ID
		if msg.Preview.Image != nil {
			templateData.Preview.PreviewImage = true
			templateData.Preview.Image = msg.Preview.Image.URL
		}
		if msg.Preview.Text != nil {
			templateData.Preview.PreviewText = true
			templateData.Preview.Title = msg.Preview.Text.Title
			templateData.Preview.Description = msg.Preview.Text.Description
			templateData.Preview.Sitename = msg.Preview.Text.SiteName
		}
	}

	switch strings.ToUpper(msg.Command) {
	case "ACTION":
		templateData.class = append(templateData.class, "user-action")
		templateData.Clipboard = fmt.Sprintf("* %s %s", templateData.Sender, templateData.Message)
	case irc.JOIN:
		templateData.Message = fmt.Sprintf("joined %s", templateData.Message)
		templateData.Clipboard = fmt.Sprintf("%s %s", templateData.Sender, templateData.Message)
		templateData.class = append(templateData.class, "secondary-action", "joinpart")
	case irc.PART:
		fallthrough
	case irc.QUIT:
		templateData.Message = fmt.Sprintf("left: %s", templateData.Message)
		templateData.Clipboard = fmt.Sprintf("%s %s", templateData.Sender, templateData.Message)
		templateData.class = append(templateData.class, "secondary-action", "joinpart")
	case irc.KICK:
		index := strings.Index(msg.Message, ":")
		kicker := templateData.Sender
		msg.Sender = msg.Message[:index]
		msg.Message = msg.Message[index+1:]
		templateData.Sender = msg.Sender
		templateData.Message = fmt.Sprintf("was kicked by <b>%s</b>: <b>%s</b>", kicker, util.Linkify(html.EscapeString(msg.Message)))
		templateData.class = append(templateData.class, "secondary-action", "kick")
		templateData.Clipboard = fmt.Sprintf("%s was kicked by %s: %s", msg.Sender, kicker, msg.Message)
	case irc.MODE:
		parts := strings.Split(msg.Message, " ")
		if len(parts) > 0 {
			templateData.Message = fmt.Sprintf("set mode <b>%s</b> for <b>%s</b>", parts[0], parts[1])
			templateData.Clipboard = fmt.Sprintf("set mode %s for %s", parts[0], parts[1])
		} else {
			templateData.Message = fmt.Sprintf("set channel mode <b>%s</b>", parts[0])
			templateData.Clipboard = fmt.Sprintf("set channel mode %s", parts[0])
		}
		templateData.class = append(templateData.class, "secondary-action", "modechange")
	case irc.NICK:
		templateData.Message = fmt.Sprintf("is now known as <b>%s</b>", msg.Message)
		templateData.class = append(templateData.class, "secondary-action", "nickchange")
		templateData.Clipboard = fmt.Sprintf("%s is now known as %s", msg.Sender, msg.Message)
	case irc.TOPIC:
		templateData.Message = fmt.Sprintf("changed the topic to <b>%s</b>", msg.Message)
		templateData.class = append(templateData.class, "secondary-action", "topicchange")
		templateData.Clipboard = fmt.Sprintf("%s changed the topic to %s", msg.Sender, msg.Message)
	default:
		templateData.IsAction = false
	}

	if msg.OwnMsg {
		templateData.class = append(templateData.class, "own-message")
		templateData.wrapClass = append(templateData.wrapClass, "own-message-wrapper")
	}

	if templateData.Joined {
		templateData.wrapClass = append(templateData.wrapClass, "message-joined")
	}

	templateData.Class = strings.Join(templateData.class, " ")
	templateData.WrapClass = strings.Join(templateData.wrapClass, " ")

	templateData.Message = util.DecodeMessage(templateData.Message)

	oldMsgWrap := jq(fmt.Sprintf("#msgwrap-%d", msg.ID))
	if oldMsgWrap.Length != 0 {
		loadedTempl := jq("<div></div>")
		templates.AppendObj("message", loadedTempl, templateData)
		oldMsgWrap.ReplaceWith(loadedTempl.Children(":first"))
	} else {
		templates.AppendObj("message", ch, templateData)
	}

	msgObj := jq(fmt.Sprintf("#msg-%d", msg.ID))

	match := GetHighlight(msg.Network, templateData.Message)

	if !templateData.IsAction && match != nil {
		msgObj.Find(".message-text").SetHtml(fmt.Sprintf("%s<span class='highlighted-text'>%s</span>%s",
			templateData.Message[:match.Index],
			templateData.Message[match.Index:match.Index+match.Length],
			templateData.Message[match.Index+match.Length:],
		))
		msgObj.AddClass("highlight")
	}

	if isNew {
		NotifyMessage(msg.Network, msg.Channel, templateData.Sender, templateData.Clipboard, match != nil)
	}
}

// GetHighlight gets the first highlight match
func GetHighlight(network, message string) *data.HighlightMatch {
	netData := data.MustGetNetwork(network)
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
	ch := data.GetChannel(network, channel)
	if ch != nil {
		notifs = ch.Notifications
	}

	hide := GetChannel(network, channel).HasClass("hidden")
	if (notifs == data.NotificationAll || (notifs == data.NotificationHighlights && highlight)) && !js.Global.Get("document").Call("hasFocus").Bool() {
		SendNotification(network, channel, sender, message)
		if hide {
			ChannelHasNewMessages(network, channel)
		}
	}

	if !hide {
		ScrollDown()
	}
}

// ChannelHasNewMessages adds the new-messages class to the channel switcher
func ChannelHasNewMessages(network, channel string) {
	jq(fmt.Sprintf("#switchto-%s-%s", NetworkFilter(network), ChannelFilter(channel))).AddClass("new-messages")
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

	if prevMsg.Attr("data-sender") != msg.Sender {
		return false
	}

	prevMsg.AddClass("message-joined-prev")
	return true
}

// OpenFullImageModal ...
func OpenFullImageModal(src string, id int64) {
	templates.Apply("image-modal", "#modal", map[string]interface{}{
		"ID":     id,
		"Source": src,
	})
	ShowModal()
}
