function updateUserList(){
  if (channelData[getActiveNetwork()] !== undefined && channelData[getActiveNetwork()][getActiveChannel()] !== undefined
    && channelData[getActiveNetwork()][getActiveChannel()].userlist !== undefined) {
    if (isUserListHidden() && !wasUserListHiddenManually()) toggleUserList(false)

    $("#userlist").text("")
    channelData[getActiveNetwork()][getActiveChannel()].userlist.forEach(function(val, i, arr){
      $("#userlist").append(val + "<br>")
    })
  } else if (!isUserListHidden()) toggleUserList(false)
}

function isUserListHidden() {
  return $("#userlist").hasClass("hidden")
}

function wasUserListHiddenManually() {
  return $("#userlist").hasClass("hidden-manual")
}

function toggleUserList(manual) {
  if ($("#userlist").hasClass("hidden")) {
    $("#userlist").removeClass("hidden")
    $("#userlist").removeClass("hidden-manual")
    $("#messaging").removeClass("messaging-userlisthidden")
  } else {
    $("#userlist").addClass("hidden")
    if(manual) $("#userlist").addClass("hidden-manual")
    $("#messaging").addClass("messaging-userlisthidden")
  }
}

function userAutocomplete(){
  if (channelData[getActiveNetwork()] !== undefined && channelData[getActiveNetwork()][getActiveChannel()] !== undefined &&
      channelData[getActiveNetwork()][getActiveChannel()].userlistplain !== undefined) {
    var list = channelData[getActiveNetwork()][getActiveChannel()].userlistplain
    var messagebox = $("#message-text")
    var text = messagebox.val().toLowerCase()
    var index = -1
    list.forEach(function(val, i, arr){
      if(val.toLowerCase().startsWith(text)) {
        if (index !== -1) {
          index = -2
        } else {
          index = i
        }
      }
    })
    if (index > -1) {
      messagebox.val(list[index] + ": ")
    }
  }
}
