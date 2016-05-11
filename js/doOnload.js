window.onload = () => {
	document.addEventListener("keydown", keyPress);
	document.addEventListener("keyup", checkStates);
	document.body.addEventListener("mousewheel", scrollHandler, false);
	
	tlCon.tab.add("Home", 'statuses/home_timeline');
	tlCon.tab.add("My Tweets", 'statuses/user_timeline', {screen_name: 'NardinRinet'}); console.log(tlOrder);
	tlCon.update("Home", 1);
	ReactDOM.render(
		<div>
			<display.tabs tlOrderArray={tlOrder} />
			<display.tweets tabName={"Home"} />
		</div>
		, document.getElementsByTagName("article")[0]
	)
};