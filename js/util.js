function showAlert(type, message) {
  $("#status-messages").loadTemplate($("#template-" + type), {
    message: message
  }, {append: true})
  if($("#status-messages").attr('hidden')) {
    $("#status-enter").addClass("new-messages")
  }
}

function scrollDown(){
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
}

function notify(user, message) {
  if (Notification.permission === "granted") {
    var n = new Notification(user,{body: message});
  }
}
