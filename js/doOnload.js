

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
};

/*

var storedTabs = [];
for(var ts in tl) {
	storedTabs.push(tl[ts].tweets.map(v => v.outerHTML))
}
state.tl = JSON.stringify(storedTabs)

state.tl = JSON.parse(d.tl).map(function(v){;
 */