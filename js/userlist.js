function updateUserList(){
  if (channelData[getActiveNetwork()] !== undefined && channelData[getActiveNetwork()][getActiveChannel()] !== undefined) {
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
