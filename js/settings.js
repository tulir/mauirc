function openSettings(){
	if ($("#messaging").hasClass("hidden-tablet-down")) {
    switchView(false)
  }

	$("body").loadTemplate($("#template-settings"), {

	}, {append: true, isFile: false, async: false})

	$('#settings').modal({
		fadeDuration: 100,
		clickClose: false,
		showClose: true
	})
}
