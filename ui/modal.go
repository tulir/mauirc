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
	"github.com/gopherjs/jquery"
)

var jq = jquery.NewJQuery

// ShowModal shows the modal container
func ShowModal() {
	jq("#modal-container").RemoveClass("hidden")
}

// HideModal hides the modal container and deletes the contents of the modal
func HideModal() {
	jq("#modal-container").AddClass("hidden")
	jq("#modal").Empty()
}
