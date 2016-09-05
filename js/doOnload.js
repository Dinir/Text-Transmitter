window.onload = () => {
	document.addEventListener("keydown", keyPress);
	document.addEventListener("keyup", checkStates);
	document.body.addEventListener("mousewheel", scrollHandler, false);
	//test scripts
	tlCon.tab.add("Home",{});
	tlCon.tab.add("Mention",{},0);
};
