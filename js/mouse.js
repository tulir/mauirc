
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
})
