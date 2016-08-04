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

// Package data contains the session data storage system
package data

// Channel contains channel data
type Channel struct {
	Userlist        []string
	UserlistPlain   []string
	Topic           string
	TopicSetBy      string
	TopicSetAt      int64
	Notifications   NotificationLevel
	HistoryFetched  bool
	FetchingHistory bool
	MessageCache    chan interface{}
}

// CreateChannel creates a channel
func CreateChannel() *Channel {
	return &Channel{}
}

// SetTopicData sets all topic-related variables
func (ch *Channel) SetTopicData(topic, setby string, setat int64) {
	ch.Topic = topic
	ch.TopicSetBy = setby
	ch.TopicSetAt = setat
}

// SetUserlist sets the userlist and the plain userlist
func (ch *Channel) SetUserlist(users []string) {
	ch.Userlist = users
	ch.UserlistPlain = make([]string, len(ch.Userlist))
	for i, user := range ch.Userlist {
		char := user[0]
		if char == '~' || char == '&' || char == '@' || char == '%' || char == '+' {
			ch.UserlistPlain[i] = user[1:]
		} else {
			ch.UserlistPlain[i] = user
		}
	}
}
