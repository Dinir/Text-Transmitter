

window.onload = () => {
	// load state stored before.
	console.groupCollapsed("Loading state...");
	stateCon.load();
	console.groupEnd();
	// build the screen.
	
	// add default event listeners globally.
	document.addEventListener("keydown", keyPress);
	document.addEventListener("keyup", checkStates);
	document.body.addEventListener("mousewheel", scrollHandler, false);
};
