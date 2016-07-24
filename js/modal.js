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

jQuery.fn.registerModalWrapper() {
  "use strict"
  this.addClass("lib-modal-wrapper")
  this.addClass("lib-modal-hidden")
  this.click(function() {
    this.closeModal()
  })
}

jQuery.fn.registerModal(registerWrapper) {
  "use strict"
  if (!this.parent().hasClass("lib-modal-wrapper")) {
    if (registerWrapper) {
      this.parent().registerModalWrapper()
    } else {
      return false
    }
  }
  this.addClass("lib-modal")
  this.addClass("lib-modal-hidden")
  return true
}

jQuery.fn.closeModal() {
  "use strict"
  if(this.hasClass("lib-modal-wrapper")) {
    this.addClass("lib-modal-hidden")
    this.find(".lib-modal:not(.lib-modal-hidden)").addClass("lib-modal-hidden")
    return true
  } else if (this.hasClass("lib-modal")) {
    this.addClass("lib-modal-hidden")
    this.parent().addClass("lib-modal-hidden")
    return true
  }
  return false
}

jQuery.fn.openModal() {
  "use strict"
  if (this.hasClass("lib-modal-wrapper")) {
    this.removeClass("lib-modal-hidden")
    this.find(".lib-modal").removeClass("lib-modal-hidden")
    return true
  } else if (this.hasClass("lib-modal")) {
    this.removeClass("lib-modal-hidden")
    this.parent().removeClass("lib-modal-hidden")
    return true
  }
  return false
}
