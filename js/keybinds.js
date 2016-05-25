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
Mousetrap.bind('up up down down left right left right b a', function() {
  "use strict"
  if(!debug) {
    alert("Debug mode enabled")
    debug = true
  } else {
    alert("Debug mode disabled")
    debug = false
  }
  window.localStorage.debug = debug
})

Mousetrap.bind('a b right left right left down down up up', function() {
  "use strict"
  if(!debugTrace) {
    alert("Debug trace enabled")
    debugTrace = true
  } else {
    alert("Debug trace disabled")
    debugTrace = false
  }
  window.localStorage.debugTrace = debugTrace
})

Mousetrap.bind('alt+r', function() {
  "use strict"
  openRawIO(getActiveNetwork())
})
