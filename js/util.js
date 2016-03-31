function showAlert(type, message) {
  $("#status-messages").loadTemplate($("#template-" + type), {
    message: message
  }, {append: true})
  if($("#status-messages").hasClass('hidden')) {
    $("#status-enter").addClass("new-messages")
  }
}

function scrollDown(){
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
}

function notify(user, message) {
  if (Notification.permission === "granted") {
    new Notification(user,{body: message, icon: '/favicon.ico'});
  }
}

var tagsToEscape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function escapeTag(tag) {
    return tagsToEscape[tag] || tag;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, escapeTag);
}

String.prototype.escapeRegex = function(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(this.escapeRegex(search), 'g'), replacement);
};
