//import {execute} from "./commandHandler.js";

// Shift Ctrl Alt 16 17 18
// or, use e.shiftKey/ctrlKey/altKey
// PgUp PgDn End Home 33 34 35 36
// a-z 65-90
// ; 186
// Backspace 8

let receivingCommand = false;
let navigatingThroughTweets = true;
let lastKeyCode = 0;
let tToReply = ""; // tweet to reply
let iToReply = ""; // id to reply
let oToReply = ""; // others to reply (people mentioned in tweets)
let currentCmdInQuery;
let currentTweetId; // handled in displayLayout.js and this file. Each handles keyboard movement cases and mouse click cases.
let cmdContextText, cmdContextRightText;
const setCmdContext = (texts) => {
	if(texts) {
		if(texts.constructor===Array) {
			// if(varname) passes any non-empty string
			// if(varname !== undefined) passes any string
			if(texts[0]) cmdContextText = texts[0];
			if(texts[1] !== undefined) cmdContextRightText = texts[1];
		} else {
			cmdContextText = texts;
			cmdContextRightText = "";
		}
	} else {
		cmdContextText = cmdContextRightText = "";
	}
	loCon.cmdContextUpdate();
};

function keyPress(e) {
	lastKeyCode = e.keyCode;
	//console.log(`${e.type} ${e.keyCode} ${e.code} ${e.charCode}`);
	//e.preventDefault();
	const query = document.getElementById("query");

	// scroll a page when presses 'PgUp/Dn'
	if(e.keyCode===33 || e.keyCode===34) {
		document.body.scrollTop += (e.keyCode===33?-1:1)*(window.innerHeight-charHeight-layout.tabs.getBoundingClientRect().height);
		// console.log(
		// 	window.innerHeight-charHeight-layout.tabs.getBoundingClientRect().height
		// );
	}
	
	// scroll to the end when presses 'Home/End'

	if(!receivingCommand) { // when the buffer is closed
		// ':' or '/' to open buffer
		if(e.shiftKey && e.keyCode===186 || e.keyCode===191) {
			ctl.toggleCommand();
			navigatingThroughTweets = !navigatingThroughTweets;
		}
		// if pressed arrow keys or hjkl
		if((e.keyCode>=37 && e.keyCode<=40) ||
		   e.keyCode===72 || e.keyCode===74 || e.keyCode===75 || e.keyCode===76) {
			const k = e.keyCode;
			switch(k) {
				case 37:
				case 72: // left
					if(tlCurrent != 0) {
						loCon.updateTabs("change", tlCurrent-1);
					}
					break;
				case 40:
				case 74: // down
					loCon.updateSelector(-1);
					break;
				case 38:
				case 75: // up
					loCon.updateSelector(1);
					break;
				case 39:
				case 76: // right
					if(tlCurrent < tlOrder.length-1) {
						loCon.updateTabs("change", tlCurrent+1);
					}
					break;
			}
		}
		
		// start of shortcut keys
		
		// write tweet
		if(e.keyCode === 73) {
			tToReply = "";
			changeCmdQueryTo("compose");
			let d = setTimeout(function(){query.value = query.value.substring(0,query.value.length-1); clearTimeout(d);}, 10);
		}
		
		// reply & quote
		if(e.keyCode === 79) {
			if(!e.shiftKey) {
				tToReply = layout.main.children[layout.selectorPos].id;
				iToReply = layout.main.children[layout.selectorPos].getElementsByClassName("username")[0].innerHTML;
				oToReply = layout.main.children[layout.selectorPos].getElementsByClassName("text")[0].innerHTML.match(/@\w+/g);
				if(oToReply) {
					oToReply = (oToReply.join(" ")+" ").replace(`@${myName} `,"");
				} else {oToReply="";}
				changeCmdQueryTo(`reply ${tToReply} @${iToReply} ${oToReply}`);
				let d = setTimeout(function() {
					query.value = query.value.substring(0, query.value.length-2);
					clearTimeout(d);
				}, 10);
			} else if(e.shiftKey) {
				const tToQuote = layout.main.children[layout.selectorPos].getElementsByClassName("timestamp")[0].outerHTML.match(/(https.+)&quot\;\)\"\>/)[1];
				changeCmdQueryTo(`compose `+` ${tToQuote}`);
				let d = setTimeout(function(){
					query.value = query.value.substring(0,query.value.length-1);
					query.setSelectionRange(9,9);
					clearTimeout(d);
				}, 10);
			}
		}
		
		// retweet
		if(e.keyCode === 82) {
			if(e.ctrlKey && !e.shiftKey) {
				stateCon.save();
				location.reload();
			}
			if(e.shiftKey) {
				cmd["retweet"](currentTweetId);
			}
		}
		
		// del
		if(e.keyCode === 68) {
			if(e.shiftKey) {
				cmd["del"](currentTweetId);
			}
		}
		
		// update current tab
		if(e.keyCode === 85) {
			if(!e.shiftKey) {
				cmd["update"]();
			} else if(e.shiftKey) {
				const curScr = document.body.scrollTop;
				// cmd.update(tlOrder[tlCurrent], -1);
				tlCon.update(tlOrder[tlCurrent], -1);
				let scrBack = setTimeout(function(){
					window.scrollTo(0,curScr);
					loCon.updateScroll();
					clearTimeout(scrBack)
				},1300);
			}
		}

	} else { // when the buffer is open

		// 'esc' or 'enter' to close buffer.
		if(e.keyCode===27 || (!e.shiftKey && e.keyCode===13)) {
			if(e.keyCode===13) execute(query.value);
			ctl.toggleCommand();
			navigatingThroughTweets = !navigatingThroughTweets;
		}
	}
}

function checkStates() {
	const query = document.getElementById("query");
	const context = document.getElementById("commandContext");
	// 'backspace' or 'delete' to empty the buffer to close it
	if((lastKeyCode===8 || lastKeyCode===46)
	                      && query.value.length === 0)
		ctl.toggleCommand();
	
	// shows related status above the query
	if(query && query.value.length>=3) {
		if(query.value.match(/:([\w\d]+)\s/)) {
			currentCmdInQuery = query.value.match(/:([\w\d]+)\s/)[1];
			if(cmd.hasOwnProperty(currentCmdInQuery)) {
				if(currentCmdInQuery === "compose") {
					setCmdContext([
						cmdDict.show(currentCmdInQuery),
						`${query.value.length-currentCmdInQuery.length-2}/140`
					]);
				} else if(currentCmdInQuery === "reply") {
					let wc = query.value.length-currentCmdInQuery.length-tToReply.length-3;
					setCmdContext([
						''+cmdDict.show(currentCmdInQuery)+`<span style="position: absolute; top: 0; left: 94px;">TO @${iToReply?iToReply:tToReply} --</span>`,
						`${wc>=0?wc:0}/140`
					]);
				} else {
					setCmdContext(cmdDict.show(currentCmdInQuery));
				}
			}
		}
	} else {
		setCmdContext();
	}
}

// it toggles what the bottom line shows every time it's invoked.
const ctl = {
	toggleCommand: () => {
		const query = document.getElementById("query");
		const status = document.getElementById("status");
		const commandInput = document.getElementById("commandInput");
		if(receivingCommand) {
			query.value = "";
			status.style.display = "inherit";
			commandInput.style.display = "none";
		} else {
			status.style.display = "none";
			commandInput.style.display = "inherit";
			document.getElementById("query").focus();
		}
		receivingCommand = !receivingCommand;
	}
};

// makes it so body scrolls 3 lines at a time.
const scrollHandler = () => {
	const e = window.event;
	document.body.scrollTop += (e.wheelDelta>0?-1:1)*3*charHeight;
	loCon.updateScroll();
	return false;
};

const clickHandler = (element) => {
	//console.log(event);
	
	if(event.clientY < layout.tabs.getBoundingClientRect().height) {
		// clicked tabs line
		if(event.target.id.match(/tab\d+/)) {
			// clicked a tab
			loCon.updateTabs(
				"change",
				parseInt(event.target.id.match(/\d+/))
			);
		} else if(event.target.id === "close") {
			// clicked the close button
			loCon.updateTabs("close");
		}
			
	}
	if(event.clientY > layout.tabs.getBoundingClientRect().height &&
	   event.clientY < window.innerHeight-charHeight) {
		// clicked main layout
		currentTweetId = selectTweetFrom(event);
	}
	if(event.clientY > window.innerHeight-charHeight) {
		// clicked control line
	}
};

const selectTweetFrom = source => {
	if(source.path) { // then it's MouseEvent
		let theTweet = source.path.find(value => value.className==="twitObj");
		if(theTweet) {
			const id = theTweet.id;
			let order = 0;
			while((theTweet = theTweet.previousSibling)!==null) order++;
			loCon.updateSelector(-2);
			layout.selectorPos = order;
			loCon.updateSelector(2);
			return id;
		} else {
			return;
		}
	}
	if(source.constructor === Array) {// then it'd be a position, [x,y]
		// NOT FINISHED
		let theTweet = document.elementFromPoint(...source);
	}
};