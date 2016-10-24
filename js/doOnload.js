window.onload = () => {
	// load state stored before.
	// also build the screen.
	console.groupCollapsed("Loading state...");
	stateCon.load();
	//stateCon.make();
	console.groupEnd();
	// add default event listeners globally.
	document.addEventListener("keydown", keyPress);
	document.addEventListener("keyup", checkStates);
	document.addEventListener("click", function(){clickHandler(window.event.target)});
	document.body.addEventListener("mousewheel", scrollHandler, false);
	getLists();
};

window.onunload = () => {
	stateCon.save();
};