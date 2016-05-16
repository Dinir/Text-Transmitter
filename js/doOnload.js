window.onload = () => {
	/*document.addEventListener("keydown", receiveKey);
	document.addEventListener("keyup", checkStates);
	document.body.addEventListener("mousewheel", scrollHandler, false);*/
	
	tlCon.tab.add("Home", 'statuses/home_timeline');
	tlCon.tab.add("My Tweets", 'statuses/user_timeline', {screen_name: 'NardinRinet'}); console.log(tlOrder);
	//tlCon.update("Home", 1);

	tlCurrent = 0; console.log(tlOrder[tlCurrent]);
	let test = tl.get("Home");
	test.tweets = testTweets;
	tl.set("Home", test);

	ReactDOM.render(
		<display.Main />
		, document.getElementsByTagName("article")[0]
	)
};

function scrState(h) {
	cmd.rs(80, h);
	window.scrollTo(0,2000);
	console.log(`scrollable height: ${document.body.clientHeight-window.innerHeight}
maximum scroll: ${document.body.scrollTop} in (${window.innerHeight/15} lines)`)
}