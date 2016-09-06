

window.onload = () => {
	// load settings stored before.
	console.groupCollapsed("Loading settings...");
	settingsCon.load();
	console.groupEnd();
	// add default event listeners globally.
	document.addEventListener("keydown", keyPress);
	document.addEventListener("keyup", checkStates);
	document.body.addEventListener("mousewheel", scrollHandler, false);
};
