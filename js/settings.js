function openSettings(){
	if ($("#messaging").hasClass("hidden-tablet-down")) {
    switchView(false)
  }

	$('#settings').modal({
		fadeDuration: 100,
		clickClose: false,
		showClose: true
	})
}
