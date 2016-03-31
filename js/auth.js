function auth() {
  authfail = false
  payload = {
    email: $("#email").val(),
    password: $("#password").val()
  }
  $.ajax({
    type: "POST",
    url: "/auth",
    data: JSON.stringify(payload),
    contentType: "application/json; charset=utf-8",
    success: function(data){
      console.log("Successfully authenticated!")
      connect()
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Authentication failed: " + textStatus + " " + errorThrown)
      console.log(jqXHR)
      authfail = true
    }
  });
}

function checkAuth(){
  authfail = false
  $.ajax({
    type: "GET",
    url: "/authcheck",
    success: function(data){
      if (data === "true") {
        connect()
      } else {
        authfail = true
        $("#container").loadTemplate($("#template-login"), {})
        msgcontainer = false
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Auth check failed: " + textStatus)
      authfail = true
      $("#container").loadTemplate($("#template-login"), {})
      console.log(jqXHR)
    }
  });
}
