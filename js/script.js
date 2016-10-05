const sh = require('shell');
// function that replaces string.
// http://codepen.io/Dinir/pen/amJEzY
// argument receive type:
// 1: string, start, end, stringToReplace
// 2: str, start1, end1, repl1, start2, end2, repl2, ...
// 3: str, [start1,end1,start2,end2,...], [repl1,repl2,...]
const replaceStr = function (str, start, end, repl) {
	if (arguments.length === 4) {
		// if arguments is simple as defined above, do this. One single replacement.
		return str.substring(0, start) + repl + str.substring(end);
	} else if (arguments.length % 3 - 1 === 0) {
		// if arguments are little complex, as 'str, start1, end1, repl1, start2, end2, repl2, ...', do this.
		let result = "";
		for (let i = 0; i < arguments.length; i += 3) {
			result += i === 0 ? str.slice(0, arguments[i + 1]) : arguments[i] + str.slice(arguments[i - 1], i === arguments.length - 1 ? str.length : arguments[i + 1]);
		}
		return result;
	} else if (arguments.length === 3 && arguments[1].constructor === Array && arguments[2].constructor === Array) {
		// first array [1] will contain indices, second array [2] will contain texts as replacement.
		const s = str,
		      is = arguments[1],
		      t = arguments[2];
		let result = "";
		for (let i = 0; i < t.length; i++) {
			result += (i === 0 ? s.slice(0, is[i]) : "") + t[i] + s.slice(is[2 * i + 1], i === t.length - 1 ? s.length : is[2 * i + 2]);
		}
		return result;
	}
};
const convertLineBreaks = str => str.replace(/(?:\r\n|\r|\n)/g, "<br>");

const URI = {
	"Mention": 'statuses/mentions_timeline',
	"User": 'statuses/user_timeline',
	"Home": 'statuses/home_timeline',
	"RTed": 'statuses/retweets_of_me',
	"DM Sent": 'direct_messages/sent',
	"Search": 'search/tweets',
	"DM": 'direct_messages',
	"L": 'lists/statuses'
};
const streamURI = {
	"Filter": 'statuses/filter',
	"Sample": 'statuses/sample',
	"User": 'user'
};

const getURIListInString = () => {
	let urilist = '';
	for (let i in URI) {
		urilist += (urilist.length === 0 ? "" : ", ") + i;
	}
	return urilist;
};

const getLists = () => {
	let l;
	t.get('lists/list', {}, function (e, d, r) {
		if (e) {
			console.error("An error occurred while fetching lists.");
			return e;
		}
		l = d;
		l.list = l.map(v => v.slug + "<span>(" + v.description + ")</span>").join(", ");
		lists = l;
	});
};
const newImgAnchor = addresses => {
	let address = [];
	if (addresses.constructor === Array) {
		if (addresses[0]) address[0] = addresses[0];
		if (addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("a", "link img", address[0], [], "href", `${ address[1] ? address[1] : address[0] }`, "target", "_blank");
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor, theAnchor.indexOf(">"), theAnchor.indexOf(">") + 1, ` onmouseover="showImageOnMouseMove(1,event,'${ address[1] ? address[1] : address[0] }')" onmouseout="showImageOnMouseMove(0)">`);
	return theAnchor;
};
const newLinkAnchor = addresses => {
	let address = [];
	if (addresses.constructor === Array) {
		if (addresses[0]) address[0] = addresses[0];
		if (addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("span", "link", address[0], []);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor, theAnchor.indexOf(">"), theAnchor.indexOf(">") + 1, ` onclick='sh.openExternal("${ address[1] ? address[1] : address[0] }")'>`);
	return theAnchor;
};
const newHashtagAnchor = addresses => {
	let address = [];
	if (addresses.constructor === Array) {
		if (addresses[0]) address[0] = addresses[0];
		if (addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("span", "link", address[0], []);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor, theAnchor.indexOf(">"), theAnchor.indexOf(">") + 1, ` onclick='sh.openExternal("${ address[1] ? address[1] : address[0] }")'>`);
	return theAnchor;
};

const showImageOnMouseMove = function (t, e, a) {
	switch (t) {
		case 1:
			var iv = document.getElementById('imgView').firstChild.firstChild;
			iv.src = a;
			iv.parentNode.parentNode.style.left = Math.floor((e.x + (e.x > window.innerWidth / 2 ? -1 * (iv.parentNode.parentNode.getBoundingClientRect().width + 3) : 5)) / charWidth) * charWidth + 'px'; // 3, 5: see scss file for section#imgView img!
			iv.parentNode.parentNode.style.top = Math.floor((e.y + (e.y > window.innerHeight / 2 ? -1 * (iv.parentNode.parentNode.getBoundingClientRect().height - charHeight) : charHeight)) / charHeight) * charHeight + 'px';
			break;
		case 0:
			var iv = document.getElementById('imgView');
			iv.style.top = "100%";
			iv.style.left = 0;
			break;
	}
};
const openNewTabFromLink = function () {};
// quick dom creator
// accept tag, [classname, id], innerHTML, [childrenNodes].
const dobj = function (tag, names, inner, children, ...moreProps) {
	let newOne = document.createElement(tag);

	if (names) {
		if (names.constructor === Array) {
			names[0] ? newOne.className = names[0] : "";
			names[1] ? newOne.id = names[1] : "";
		} else newOne.className = names;
	}

	inner ? newOne.innerHTML = inner : "";

	newOne.appendChildren = function (c) {
		if (c && c.constructor === Array) {
			newOne.appendChildren(...c);
		} else for (let i in arguments) newOne.appendChild(arguments[i]);
	};

	if (children) {
		if (children.constructor === Array) newOne.appendChildren(...children);else newOne.appendChild(children);
	}

	if (moreProps) {
		for (let k = 0; k < moreProps.length; k += 2) {
			newOne[moreProps[k]] = moreProps[k + 1];
		}
	}

	return newOne;
};

const changeClass = (target, firstCl, secondCl) => {
	// if first exist = add it
	// if both exist = change first to second
	if (target) {
		if (firstCl) {
			if (!secondCl) {
				target.className += ` ${ firstCl }`;
			} else {
				target.className = firstCl === "*" ? secondCl : target.className.replace(new RegExp('\\s?' + firstCl), secondCl === " " ? "" : secondCl);
			}
		}
	}
};
const replaceDobj = (to, from) => {
	from.parentNode.replaceChild(to, from);
};
let cmd = {
	resize: function (w, h) {
		window.resizeTo((w > 13 ? w : 13) * 8, (h > 6 ? h : 6) * 15 /*+25*/);
	},
	rs: function (w, h) {
		return this.resize(w, h);
	},

	compose: function (txt, params) {
		let p;
		if (params) {
			p = params;
		} else {
			p = {};
		}
		p.status = txt;
		//if(tToReply) p.in_reply_to_status_id = tToReply;
		t.post('statuses/update', p, function (e, d, r) {
			if (e) {
				console.error("Failed composing tweet.");
				console.log(e);
				return;
			}
			console.log("Composing succeed.");
			composing = !composing;
			cmd.update();
		});
		tToReply = "";
	},
	reply: function (id, txt) {
		// tToReply and iToReply are set in commandReceiver, when the key is pressed.
		cmd.compose(txt, { in_reply_to_status_id: id });
		cmd.update();
	},
	retweet: function (id) {
		let idToRT = id ? id : currentTweetId;
		t.post('statuses/retweet/:id', { id: idToRT }, function (e, d, r) {
			if (e) {
				console.error("Failed retweeting the tweet.");
				console.log(e);
				return;
			}
			console.log("The tweet has been retweeted.");
			console.log(d);
			cmd.update();
		});
	},
	del: function (id) {
		let idToDel = id ? id : currentTweetId;
		t.post('statuses/destroy/:id', { id: idToDel, trim_user: true }, function (e, d, r) {
			if (e) {
				console.error("Failed deleting tweet.");
				console.log(e);
				return;
			}
			console.log("Tweet has been deleted.");
			console.log(d);
		});
	},

	add: function (names, par, pos) {
		switch (names) {
			case "L":
				changeCmdQueryTo("addlist");
				break;
			default:
				tlCon.tab.add(names, par, pos);
				break;
		}
	},
	addlist: function (sname, lslug) {
		let p = {
			owner_screen_name: sname,
			slug: lslug
		};
		tlCon.tab.add("L", p);
		tlCon.tab.rename("L", `L_${ lslug }`);
	},
	remove: function (tabName) {
		tlCon.tab.remove(tabName);
	},
	rm: function (tabName) {
		return this.remove(tabName);
	},
	rename: function (tabName, alterName) {
		tlCon.tab.rename(tabName, alterName);
	},
	rn: function (tn, an) {
		return this.rename(tn, an);
	},

	update: function (tabName, direction) {
		let tn, dr;
		if (tabName) {} else {
			tn = tlOrder[tlCurrent];
		};
		if (direction) {} else {
			dr = 1;
		};
		tlCon.update(tn, dr);
	},
	u: function (tabName, direction) {
		return this.update(tabName, direction);
	}
};
const cmdDict = {
	show: cmd => {
		if (cmdDict[cmd].p) {
			return `<div><div class="contextCmdDict">${ cmdDict[cmd].p }</div>${ cmdDict[cmd].d }</div>`;
		} else {
			return `<div>${ cmdDict[cmd].d }</div>`;
		}
	},

	resize: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	rs: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	compose: {
		"p": "",
		"d": "-- COMPOSE --"
	},
	reply: {
		"p": "",
		"d": "-- REPLYING&nbsp;"
	},
	retweet: {
		"p": "retweet( id)",
		"d": "Retweet a tweet with the id. omit id to retweet currently selected tweet."
	},
	del: {
		"p": "del( id)",
		"d": "Delete a tweet with the id. Omit id to delete currently selected tweet."
	},
	add: {
		"p": "add [nameOfTab,(URI)]( parameters position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name','URI'], or skip URI and just choose one from below:<br>" + `${ getURIListInString() }<BR>` + "If you know what parameters are, you can add them as a form of an object.<BR>" + "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	addlist: {
		"p": "addlist screenName listSlug",
		"d": "Add a list with the listSlug, made by screenName. <br>" + "screenName is the twitter username, <br>" + "listSlug is a name consist of lower-cases-alphabet-and-hyphens.<br>"
	},
	remove: {
		"p": "remove( nameOfTab)",
		"d": "Remove a tab with the name. Omit nameOfTab to remove current tab."
	},
	rm: {
		"p": "remove( nameOfTab)",
		"d": "Remove a tab with the name. Omit nameOfTab to remove current tab."
	},
	rename: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	rn: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	update: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets."
	},
	u: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets"
	}
};
function execute(command) {
	let prefix = command.slice(0, 1);
	let argv = command.trim().substr(1).split(" ");
	let cmdName = argv.shift();
	if (cmdName == "compose") {
		cmd[cmdName](argv.join(" "));
	} else if (cmdName == "reply") {
		let cmdTarget = argv.shift();
		cmd[cmdName](cmdTarget, argv.join(" "));
	} else {
		cmd[cmdName](...argv);
		console.log(cmdName);
		console.log(argv.join(" "));
	}
}
function changeCmdQueryTo(command) {
	ctl.toggleCommand();
	let q = document.getElementById("query");
	q.value = `:${ command } `;
	let cp = command.match(/([\w\d]+)\s/);
	if (cp) {
		setCmdContext(cmdDict.show(cp[1]));
	} else {
		setCmdContext(cmdDict.show(command));
	}
}
//import {execute} from "./commandHandler.js";

// Shift Ctrl Alt 16 17 18
// or, use e.shiftKey/ctrlKey/altKey
// PgUp PgDn End Home 33 34 35 36
// a-z 65-90
// ; 186
// Backspace 8

let receivingCommand = false;
let composing = false;
let navigatingThroughTweets = true;
let lastKeyCode = 0;
let tToReply = ""; // tweet to reply
let iToReply = ""; // id to reply
let currentCmdInQuery;
let currentTweetId;
let cmdContextText, cmdContextRightText;
let lists = [];
const setCmdContext = texts => {
	if (texts) {
		if (texts.constructor === Array) {
			// if(varname) passes any non-empty string
			// if(varname !== undefined) passes any string
			if (texts[0]) cmdContextText = texts[0];
			if (texts[1] !== undefined) cmdContextRightText = texts[1];
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
	console.log(`${ e.type } ${ e.keyCode } ${ e.code } ${ e.charCode }`);
	//e.preventDefault();
	const query = document.getElementById("query");

	// scroll a page when presses 'PgUp/Dn'
	if (e.keyCode === 33 || e.keyCode === 34) {
		document.body.scrollTop += (e.keyCode === 33 ? -1 : 1) * (window.innerHeight - 2 * charHeight);
		if (e.keyCode === 33) // selector also goes up
			loCon.updateSelector(2);else // selector also goes down
			loCon.updateSelector(-2);
	}

	if (!receivingCommand) {
		// when the buffer is closed
		// ':' or '/' to open buffer
		if (e.shiftKey && e.keyCode === 186 || e.keyCode === 191) {
			ctl.toggleCommand();
			navigatingThroughTweets = !navigatingThroughTweets;
		}
		// if pressed arrow keys or hjkl
		if (e.keyCode >= 37 && e.keyCode <= 40 || e.keyCode === 72 || e.keyCode === 74 || e.keyCode === 75 || e.keyCode === 76) {
			const k = e.keyCode;
			switch (k) {
				case 37:
				case 72:
					// left
					if (tlCurrent != 0) {
						loCon.updateTabs("change", tlCurrent - 1);
					}
					break;
				case 40:
				case 74:
					// down
					loCon.updateSelector(-1);
					break;
				case 38:
				case 75:
					// up
					loCon.updateSelector(1);
					break;
				case 39:
				case 76:
					// right
					if (tlCurrent < tlOrder.length - 1) {
						loCon.updateTabs("change", tlCurrent + 1);
					}
					break;
			}
		}

		// start of shortcut keys

		// write tweet
		if (e.keyCode === 73) {
			tToReply = "";
			changeCmdQueryTo("compose");
			let d = setTimeout(function () {
				query.value = query.value.substring(0, query.value.length - 1);clearTimeout(d);
			}, 10);
		}

		// reply
		if (e.keyCode === 79) {
			tToReply = layout.main.children[layout.selectorPos].id;
			iToReply = layout.main.children[layout.selectorPos].getElementsByClassName("username")[0].innerHTML;
			changeCmdQueryTo(`reply ${ tToReply } @${ iToReply }`);
			let d = setTimeout(function () {
				query.value = query.value.substring(0, query.value.length - 1);clearTimeout(d);
			}, 10);
		}

		// update current tab
		if (e.keyCode === 85) {
			cmd["update"]();
		}
	} else {
		// when the buffer is open

		// 'esc' or 'enter' to close buffer.
		if (e.keyCode === 27 || !e.shiftKey && e.keyCode === 13) {
			if (e.keyCode === 13) execute(query.value);
			ctl.toggleCommand();
			navigatingThroughTweets = !navigatingThroughTweets;
		}
	}
}

function checkStates() {
	const query = document.getElementById("query");
	const context = document.getElementById("commandContext");
	// 'backspace' or 'delete' to empty the buffer to close it
	if ((lastKeyCode === 8 || lastKeyCode === 46) && query.value.length === 0) ctl.toggleCommand();

	// shows related status above the query
	if (query && query.value.length >= 3) {
		if (query.value.match(/:([\w\d]+)\s/)) {
			currentCmdInQuery = query.value.match(/:([\w\d]+)\s/)[1];
			if (cmd.hasOwnProperty(currentCmdInQuery)) {
				if (currentCmdInQuery === "compose") {
					setCmdContext([cmdDict.show(currentCmdInQuery), `${ query.value.length - currentCmdInQuery.length - 2 }/140`]);
				} else if (currentCmdInQuery === "reply") {
					let wc = query.value.length - currentCmdInQuery.length - tToReply.length - 3;
					setCmdContext(['' + cmdDict.show(currentCmdInQuery) + `<span style="position: absolute; top: 0; left: 94px;">TO @${ iToReply ? iToReply : tToReply } --</span>`, `${ wc >= 0 ? wc : 0 }/140`]);
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
		if (receivingCommand) {
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
	document.body.scrollTop += (e.wheelDelta > 0 ? -1 : 1) * 3 * charHeight;
	loCon.updateScroll();
	return false;
};

const clickHandler = element => {
	//console.log(event);

	if (event.clientY < charHeight) {
		// clicked tabs line
		if (event.target.id.match(/tab\d+/)) {
			// clicked a tab
			loCon.updateTabs("change", parseInt(event.target.id.match(/\d+/)));
		} else if (event.target.id === "close") {
			// clicked the close button
			loCon.updateTabs("close");
		}
	}
	if (event.clientY > charHeight && event.clientY < window.innerHeight - charHeight) {
		// clicked main layout
		currentTweetId = selectTweetFrom(event);
	}
	if (event.clientY > window.innerHeight - charHeight) {
		// clicked control line
	}
};

const selectTweetFrom = source => {
	if (source.path) {
		// then it's MouseEvent
		let theTweet = source.path.find(value => value.className === "twitObj");
		const id = theTweet.id;
		let order = 0;
		while ((theTweet = theTweet.previousSibling) !== null) order++;
		loCon.updateSelector(-2);
		layout.selectorPos = order;
		loCon.updateSelector(2);
		return id;
	}
	if (source.constructor === Array) {
		// then it'd be a position, [x,y]
		// NOT FINISHED
		let theTweet = document.elementFromPoint(...source);
	}
};
const layout = {
	wrapper: null,
	tabs: null,
	main: null,
	controls: null,
	imgView: null,

	selectorPos: 0,
	currentLine: dobj("span", [, "currentLine"], "BOT"),
	cmdContext: dobj("div", "left", "", [dobj("div", "rightText", "")])
};

// layout controller.
const loCon = {
	updateTabs: (eventType, clickedNumber) => {
		switch (eventType) {
			case "change":
				if (tlCurrent !== clickedNumber) {
					if (layout.tabs.tabDoms[tlCurrent]) changeClass(layout.tabs.tabDoms[tlCurrent], "chosen", " ");
					changeClass(layout.tabs.tabDoms[clickedNumber], "chosen");
					tlCurrent = clickedNumber;
				}
				loCon.updateMain();
				break;
			case "close":
				tlCon.tab.remove(tlOrder[tlCurrent]);
				loCon.updateTabs();
				loCon.updateMain();
				break;
			default:
				layout.tabs = new display.tabObj(tlOrder);
				layout.tabs.make();
				replaceDobj(layout.tabs, document.getElementById("tabs"));
				break;
		}
	},
	updateMain: () => {
		if (layout.main && layout.main.children[layout.selectorPos]) {
			loCon.updateSelector(-2);
		}
		layout.main = dobj("section", [, "main"], "");
		layout.main.appendChildren(...tl[tlOrder[tlCurrent]].tweets);
		replaceDobj(layout.main, document.getElementById("main"));
		if (layout.main.children[layout.selectorPos]) {
			loCon.updateSelector();
		}
		loCon.updateTS();
	},
	updateTS: ifAll => {
		if (ifAll) {
			for (let i in tl) {
				for (let j = 0; j < tl[i].tweets.length; j++) {
					updateTimestamps(tl[i].tweets[j]);
				}
			}
		} else {
			const cur = tlOrder[tlCurrent];
			for (let j = 0; j < tl[cur].tweets.length; j++) {
				updateTimestamps(tl[cur].tweets[j]);
			}
		}
	},
	updateStatus: () => {},
	updateSelector: direction => {
		// do not set variables for frequently used parts
		// no curtl = tl[tlOrder[tlCurrent]],
		// no listArray = layout.main.children
		switch (direction) {
			case 1:
				// going up
				if (layout.selectorPos > 0) {
					changeClass(layout.main.children[layout.selectorPos--], "cursor", " ");
					changeClass(layout.main.children[layout.selectorPos], "cursor");
					currentTweetId = layout.main.children[layout.selectorPos].id;
				}
				break;
			case -1:
				// going down
				if (layout.selectorPos < tl[tlOrder[tlCurrent]].tweets.length - 1) {
					changeClass(layout.main.children[layout.selectorPos++], "cursor", " ");
					changeClass(layout.main.children[layout.selectorPos], "cursor");
					currentTweetId = layout.main.children[layout.selectorPos].id;
				}
				break;
			case -2:
				// remove current selector indicatior
				if (layout.main && layout.main.children) {
					changeClass(layout.main.children[layout.selectorPos], "cursor", " ");
					currentTweetId = "";
				}
				break;
			case -3:
				// remove selector through loop
				if (layout.main && layout.main.children) {
					for (let i in layout.main.children) {
						if (layout.main.children[i].className) changeClass(layout.main.children[i], "cursor", " ");
					}
					currentTweetId = "";
				}
				break;
			case 2:
				// add externally updated selectorPos (use with -2)
				if (layout.main && layout.main.children) {
					changeClass(layout.main.children[layout.selectorPos], "cursor");
					currentTweetId = layout.main.children[layout.selectorPos].id;
				}
				break;
			default:
				// keep the position between tabs
				// changeClass(layout.main.children[layout.selectorPos], "cursor", " ");
				if (layout.selectorPos >= tl[tlOrder[tlCurrent]].tweets.length) {
					layout.selectorPos = tl[tlOrder[tlCurrent]].tweets.length != 0 ? tl[tlOrder[tlCurrent]].tweets.length - 1 : 0;
				}
				changeClass(layout.main.children[layout.selectorPos], "cursor");
				currentTweetId = layout.main.children[layout.selectorPos].id;
				break;
		}
		if (layout.selectorPos === 0) {
			// if current pos is the first position
			window.scrollTo(0, 0); // just scroll to the top
		} else if (layout.main.children[layout.selectorPos].offsetTop - 15 < document.body.scrollTop) {
			// if the current item is above the screen
			window.scrollTo(0, layout.main.children[layout.selectorPos].offsetTop - 15); // just scroll up to the start position of the item
		} else if (layout.selectorPos === tl[tlOrder[tlCurrent]].tweets.length - 1) {
			// if current pos is the last position
			window.scrollTo(0, layout.main.clientHeight); // just scroll to the end
		} else if (layout.main.children[layout.selectorPos + 1] && layout.main.children[layout.selectorPos + 1].offsetTop > document.body.scrollTop + window.innerHeight - 15) {
			// if the next item is below the screen
			window.scrollTo(0, layout.main.children[layout.selectorPos + 1].offsetTop - window.innerHeight + 15); // scroll to next item's start position - current window height
		}
		loCon.updateScroll();
	},
	updateScroll: () => {
		// 30 is from each end of the screen: tab line, status line: 2 line makes 30 pixel height.
		if (layout.main) {
			const scrollPos = parseInt(document.body.scrollTop / (layout.main.clientHeight - (window.innerHeight - 30)) * 10000) / 100 + "%";
			if (scrollPos === "100%" || layout.main.clientHeight <= window.innerHeight - 30) {
				layout.currentLine.innerHTML = "BOT";
				const curScr = document.body.scrollTop;
				tlCon.update(tlOrder[tlCurrent], -1);
				let scrBack = setTimeout(function () {
					window.scrollTo(0, curScr);clearTimeout(scrBack);
				}, 750);
			} else layout.currentLine.innerHTML = scrollPos;
		}
	},
	// what does it do is changing parts of string:
	// from: abcde<div class='rightText'>fghij</div>
	// to  : newText<div class='rightText'>newRightText</div>
	cmdContextUpdate: () => {
		layout.cmdContext.innerHTML = layout.cmdContext.innerHTML.replace(/^.*(<div.+>).*<\/div>/, `${ cmdContextText }\$1${ cmdContextRightText }<\/div>`);
	},
	init: () => {
		layout.wrapper = dobj("article", "", "", []);
		layout.tabs = new display.tabObj(tlOrder);
		layout.main = dobj("section", [, "main"], "");
		layout.controls = dobj("section", [, "controls"], "", [dobj("div", [, "status"], "", [dobj("div", "left", "&nbsp;"), dobj("div", "rightText", "", [dobj("span", "", "&nbsp;", [], "style", "width: 8px;"), layout.currentLine, dobj("span", [, "api"], "")])]), dobj("div", [, "commandInput"], "", [dobj("div", [, "commandContext"], "", [layout.cmdContext]), dobj("input", [, "query"], "", [], "type", "text")])]);
		// this is a placeholder. :(
		layout.imgView = dobj("section", [, "imgView"], "", [dobj("div", "", "", [dobj("img")])]);

		layout.wrapper.appendChildren(layout.tabs, layout.main, layout.controls, layout.imgView);
		// document.body.appendChild(layout.wrapper);
		replaceDobj(layout.wrapper, document.body.firstChild);
		loCon.updateTabs();
	}

};
let moment = require('moment');

const storeTimestamp = rawTs => moment(rawTs, "ddd MMM D H:mm:ss Z YYYY");
const simplifyTimestamp = ts => ts.fromNow(true).replace(/a few/, "<1").replace(/^an?/, "1").replace(/\s/, "").replace(/seconds|minutes?/, "m").replace(/hours?/, "h").replace(/days?/, "d").replace(/months?/, "M").replace(/years?/, "y");

// moment().diff(ts, days') // yields 1 if now and ts are at least 1 days far.

/*
const hlsearch = (container, what, spanClass) => {
	let content = container.innerHTML,
		pattern = new RegExp('(>[^<.]*)(' + what + ')([^<.]*)','g'),
		replaceWith = '$1<span ' + ( spanClass ? 'class="' + spanClass + '"' : '' ) + '">$2</span>$3',
		highlighted = content.replace(pattern,replaceWith);
	return (container.innerHTML = highlighted) !== content;
}
*/

const display = {
	twitObj: function (raw) {
		// store default permanent data
		const id = raw.id_str;
		let timestamp = storeTimestamp(raw.created_at);
		let username = raw.user.screen_name;
		let text = raw.text;

		// less original data
		let isReply = raw.entities.user_mentions.length > 0 || raw.in_reply_to_status_id_str !== null;
		let isRetweet = typeof raw.retweeted_status !== "undefined";
		let isQuote = raw.is_quote_status;

		// make additional data related to the default data if needed
		let userRTed, timeRTed, timeQuote, userQuote, textQuote;
		if (raw.entities.user_mentions.length > 0) {}
		if (raw.in_reply_to_status_id_str !== null) {}
		if (isRetweet) {
			userRTed = username;
			timeRTed = timestamp;
			timestamp = storeTimestamp(raw.retweeted_status.created_at);
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if (isQuote) {
			if (raw.quoted_status) {
				timeQuote = storeTimestamp(raw.quoted_status.created_at);
				userQuote = raw.quoted_status.user.screen_name;
				textQuote = raw.quoted_status.text;
			} else if (raw.retweeted_status && raw.retweeted_status.quoted_status) {
				timeQuote = storeTimestamp(raw.retweeted_status.quoted_status.created_at);
				userQuote = raw.retweeted_status.quoted_status.user.screen_name;
				textQuote = raw.retweeted_status.quoted_status.text;
			}
		}

		// check image/link/hashtag/mention
		let hasImage = { T: false, RT: false, QT: false };
		let hasLink = { T: false, RT: false, QT: false };
		let hasHashtag = { T: false, RT: false, QT: false };
		let hasMention = { T: false, RT: false, QT: false };
		let images = { T: [], RT: [], QT: [] };
		let links = { T: [], RT: [], QT: [] };
		let hashtags = { T: [], RT: [], QT: [] };
		let mentions = { T: [], RT: [], QT: [] };
		// check if it has medias in its status
		if (raw.extended_entities && raw.extended_entities.media) hasImage["T"] = typeof raw.extended_entities.media !== "undefined";
		if (raw.entities) {
			if (raw.entities.urls) hasLink["T"] = raw.entities.urls.length > 0;
			if (raw.entities.hashtags) hasHashtag["T"] = raw.entities.hashtags.length > 0;
			if (raw.entities.user_mentions) hasMention["T"] = raw.entities.user_mentions.length > 0;
		}
		// check if it has medias in its rted status
		if (raw.retweeted_status) {
			if (raw.retweeted_status.extended_entities && raw.retweeted_status.extended_entities.media) hasImage["RT"] = typeof raw.retweeted_status.extended_entities.media !== "undefined";
			if (raw.retweeted_status.entities) {
				if (raw.retweeted_status.entities.urls) hasLink["RT"] = raw.retweeted_status.entities.urls.length > 0;
				if (raw.retweeted_status.entities.hashtags) hasHashtag["RT"] = raw.retweeted_status.entities.hashtags.length > 0;
				if (raw.retweeted_status.entities.user_mentions) hasHashtag["RT"] = raw.retweeted_status.entities.user_mentions.length > 0;
			}
		}
		// check if it has medias in its qted status
		if (raw.quoted_status) {
			if (raw.quoted_status.extended_entities && raw.quoted_status.extended_entities.media) hasImage["QT"] = typeof raw.quoted_status.extended_entities.media !== "undefined";
			if (raw.quoted_status.entities) {
				if (raw.quoted_status.entities.urls) hasLink["QT"] = raw.quoted_status.entities.urls.length > 0;
				if (raw.quoted_status.entities.hashtags) hasHashtag["QT"] = raw.quoted_status.entities.hashtags.length > 0;
				if (raw.quoted_status.entities.user_mentions) hasMention["QT"] = raw.quoted_status.entities.user_mentions.length > 0;
			}
		}

		// functions for exporting media data
		const exportImages = r => r.map(v => ({
			indices: v.indices,
			url: v.url,
			media_url: v.media_url_https,
			display_url: v.display_url
		}));
		const exportLinks = r => r.map(v => ({
			indices: v.indices,
			url: v.url,
			expanded_url: v.expanded_url,
			display_url: v.display_url
		}));
		const exportHashtags = r => r.map(v => ({
			indices: v.indices,
			text: v.text
		}));
		const exportMentions = r => r.map(v => ({
			indices: v.indices,
			id_str: v.id_str,
			screen_name: v.screen_name
		}));
		// export image data
		if (hasImage["RT"]) {
			images["RT"] = exportImages(raw.retweeted_status.extended_entities.media);
		} else if (hasImage["T"]) {
			images["T"] = exportImages(raw.extended_entities.media);
		}
		if (hasImage["QT"]) {
			images["QT"] = exportImages(raw.quoted_status.extended_entities.media);
		}
		// export link data
		if (hasLink["RT"]) {
			links["RT"] = exportLinks(raw.retweeted_status.entities.urls);
		} else if (hasLink["T"]) {
			links["T"] = exportLinks(raw.entities.urls);
		}
		if (hasLink["QT"]) {
			links["QT"] = exportLinks(raw.quoted_status.entities.urls);
		}
		// export hashtag data
		if (hasHashtag["RT"]) {
			hashtags["RT"] = exportHashtags(raw.retweeted_status.entities.hashtags);
		} else if (hasHashtag["T"]) {
			hashtags["T"] = exportHashtags(raw.entities.hashtags);
		}
		if (hasHashtag["QT"]) {
			hashtags["QT"] = exportHashtags(raw.quoted_status.entities.hashtags);
		}
		// export mention data
		if (hasMention["RT"]) {
			mentions["RT"] = exportMentions(raw.retweeted_status.entities.user_mentions);
		} else if (hasMention["T"]) {
			mentions["T"] = exportMentions(raw.entities.user_mentions);
		}
		if (hasMention["QT"]) {
			mentions["QT"] = exportMentions(raw.quoted_status.entities.user_mentions);
		}
		// apply the image/link/hashtag/mention
		const tplist = ["RT", "T", "QT"];
		for (let tp in tplist) {
			let curtp = tplist[tp];
			// store first length of the tweet text
			// let l = text.length;
			// let lq;
			// if(textQuote) lq = textQuote.length;
			if (hasImage[curtp]) {
				/*for(let i in images[curtp]) {
    	let indices = [], replacement = [];
    	let indicesQT = [], replacementQT = [];
    	const ci = images[curtp][i];
    	switch(curtp) {
    		case "RT":
    		case "T":
    			indices.push(ci.indices[0],ci.indices[1]);
    			replacement.push(newImgAnchor([ci.display_url,ci.url]));
    			break;
    		case "QT":
    			indicesQT.push(ci.indices[0],ci.indices[1]);
    			replacementQT.push(newImgAnchor([ci.display_url,ci.url]));
    			break;
    	}
    }*/
				for (let i in images[curtp]) {
					// const la = text.length - l;
					// let lqa;
					// if(textQuote) lqa = textQuote.length - lq;
					const ci = images[curtp][i];
					switch (curtp) {
						case "RT":
						case "T":
							let addedText = text.replace(ci.url, newImgAnchor([ci.display_url, ci.media_url]));
							text = addedText;
							break;
						case "QT":
							let addedTextQT = textQuote.replace(ci.url, newImgAnchor([ci.display_url, ci.media_url]));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for images
		for (let tp in tplist) {
			let curtp = tplist[tp];
			if (hasLink[curtp]) {
				for (let i in links[curtp]) {
					const ci = links[curtp][i];
					switch (curtp) {
						case "RT":
						case "T":
							let addedText = text.replace(ci.url, newLinkAnchor([ci.display_url, ci.expanded_url]));
							text = addedText;
							break;
						case "QT":
							let addedTextQT = textQuote.replace(ci.url, newLinkAnchor([ci.display_url, ci.expanded_url]));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for links
		for (let tp in tplist) {
			let curtp = tplist[tp];
			if (hasHashtag[curtp]) {
				for (let i in hashtags[curtp]) {
					const ci = hashtags[curtp][i];
					switch (curtp) {
						case "RT":
						case "T":
							let addedText = text.replace(`#${ ci.text }`, newLinkAnchor([`#${ ci.text }`, `https://twitter.com/hashtag/${ ci.text }?src=hash`]));
							text = addedText;
							break;
						case "QT":
							let addedTextQT = textQuote.replace(`#${ ci.text }`, newLinkAnchor([`#${ ci.text }`, `https://twitter.com/hashtag/${ ci.text }?src=hash`]));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for hashtags
		for (let tp in tplist) {
			let curtp = tplist[tp];
			if (hasMention[curtp]) {
				for (let i in mentions[curtp]) {
					const ci = mentions[curtp][i];
					switch (curtp) {
						case "RT":
						case "T":
							let addedText = text.replace(`@${ ci.screen_name }`, newLinkAnchor([`@${ ci.screen_name }`, `https://twitter.com/${ ci.screen_name }`]));
							text = addedText;
							break;
						case "QT":
							let addedTextQT = textQuote.replace(ci.url, newLinkAnchor([`@${ ci.screen_name }`, `https://twitter.com/${ ci.screen_name }`]));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for mentions
		let doesPing = false;

		if (text.match("<br>") && textQuote.match("<br>")) {} else {
			text = convertLineBreaks(text);
			if (textQuote) textQuote = convertLineBreaks(textQuote);
		}
		// make it so clicking timestamp opens tweet page in host's web browser. the code below is the timestamp that can be clicked.
		let tsDom = function () {
			const tw = document.createElement("span");
			tw.innerHTML = newLinkAnchor([simplifyTimestamp(timestamp), `https://twitter.com/${ username }/status/${ id }`]);
			tw.firstChild.className = "timestamp";
			return tw.firstChild;
		}();

		const dom = dobj("div", ["twitObj", id], "", [dobj("span", "rawTS", timestamp.format(), [], "style", "display:none;"), tsDom,
		//dobj("span","timestamp",simplifyTimestamp(timestamp)),
		dobj("span", `username${ isReply ? " reply" : "" }${ doesPing ? " ping" : "" }`, username), dobj("div", "text", text)]);
		if (isQuote && (raw.quoted_status || raw.retweeted_status && raw.retweeted_status.quoted_status)) {
			dom.appendChild(dobj("span", "quote", "", [dobj("span", "rawTS", timeQuote.format(), [], "style", "display:none;"), dobj("span", "timestamp", simplifyTimestamp(timeQuote)), dobj("span", "username", userQuote), dobj("div", "text", textQuote)]));
		}
		if (isRetweet) {
			dom.appendChild(dobj("span", "retweet", "", [dobj("span", "rawTS", timeRTed.format(), [], "style", "display:none;"), dobj("span", "username", userRTed), dobj("span", "timestamp", simplifyTimestamp(timeRTed))]));
		}
		// if(hasImage["QT"]) {
		// 	dom.querySelector(".quote .text").innerHTML =
		// 		dom.querySelector(".quote .text").innerHTML.replace()
		// }
		// if(hasImage["RT"]) {
		//
		// } else if(hasImage["T"]) {
		//
		// }

		return dom;
	},
	tabObj: function (tlOrder) {
		let dom = dobj("section", ["hl", "tabs"], "&nbsp;");
		let notis = tlOrder.map(v => tl[v].notifications);
		dom.tabDoms = [];
		dom.make = function () {
			for (let i = 0; i < tlOrder.length; i++) {
				if (notis[i]) {
					let nt = dobj("span", [i === tlCurrent ? "chosen" : "", `tab${ i }`], "", [dobj("span", [], notis[i])]);
					nt.innerHTML += `[${ tlOrder[i] }]`;
					dom.tabDoms.push(nt);
				} else {
					dom.tabDoms.push(dobj("span", [i === tlCurrent ? "chosen" : "", `tab${ i }`], `[${ tlOrder[i] }]`));
				}
			}
			dom.tabDoms.push(dobj("span", [, "close"], "X"));
			dom.appendChildren(...dom.tabDoms);
			if (document.body.firstElementChild) {
				document.body.firstElementChild.replaceChild(dom, document.getElementById("tabs"));
			} else {
				document.body.firstElementChild.appendChild(dom);
			}
		};
		dom.updateNotification = function () {};
		return dom;
	}
};

const replaceTabs = () => {
	layout.tabs = new display.tabObj(tlOrder);
	layout.tabs.make();
	replaceDobj(layout.tabs, document.getElementById("tabs"));
};
const updateTimestamps = tweetDom => {
	tweetDom.getElementsByClassName("timestamp")[0].innerHTML = simplifyTimestamp(moment(tweetDom.getElementsByClassName("rawTS")[0].innerHTML));
	if (tweetDom.getElementsByClassName("retweet").length) tweetDom.querySelector(".retweet .timestamp").innerHTML = simplifyTimestamp(moment(tweetDom.querySelector(".retweet .rawTS").innerHTML));
	if (tweetDom.getElementsByClassName("quote").length) tweetDom.querySelector(".quote .timestamp").innerHTML = simplifyTimestamp(moment(tweetDom.querySelector(".quote .rawTS").innerHTML));
};

/*
test script:

var twitDoms = []; var twts = []; t.get('statuses/user_timeline', {}, function(e,d,r){ twts=d; for(var i=0;i<twts.length;i++) twitDoms[i] = new display.twitObj(twts[i]); console.log('done'); });
*/
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
	document.addEventListener("click", function () {
		clickHandler(window.event.target);
	});
	document.body.addEventListener("mousewheel", scrollHandler, false);

	lists = getLists();
};
const fs = require('fs');

// clone objects
// http://stackoverflow.com/a/728694/4972931
function cloneObj(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = cloneObj(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = cloneObj(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}

const defaultStateFileName = `${ __dirname }/state/state.json`;
let state;
let stateFileName = `${ __dirname }/state/state.json`;
const charWidth = 8;
const charHeight = 15;
const stateCon = {
	storedTabs: {},
	restoreStoredTabs: dobj("div"),
	// these code stores tweets along 'tl'.
	// but I can't yet load tweets between preloaded tweets.
	storeTweets: () => {
		stateCon.storedTabs = cloneObj(tl);
		for (var ts in stateCon.storedTabs) stateCon.storedTabs[ts].tweets = tl[ts].tweets.map(v => v.outerHTML);
		//return JSON.stringify(stateCon.storedTabs);
		return stateCon.storedTabs;
	},
	restoreTweets: () => {
		stateCon.storedTabs = state.tl;
		for (let ts in stateCon.storedTabs) {
			stateCon.storedTabs[ts].tweets = stateCon.storedTabs[ts].tweets.map(v => {
				stateCon.restoreStoredTabs.innerHTML = v;
				return stateCon.restoreStoredTabs.firstChild;
			});
		}
		return stateCon.storedTabs;
	},

	make: () => {
		tlCon.tab.flush("Y");
		loCon.init();
		tlCon.tab.add("Mention", {});
		tlCon.tab.add("Home", {});
		tlCurrent = 1;
		const defaultState = JSON.stringify({
			"width": 80,
			"height": 24,
			"tl": stateCon.storeTweets(),
			"tlOrder": tlOrder,
			"tlCurrent": tlCurrent
		});
		state = defaultState;
		fs.writeFile(defaultStateFileName, JSON.stringify(state), 'utf8', e => {
			if (e) {
				console.error("Failed creating the default one.\n" + "Any new changes made in this session won't be saved.");
				console.log(e);
				return e;
			}
			stateFileName = defaultStateFileName;
			console.log("Created the default state.");
		});
		loCon.updateTabs();
		loCon.updateMain();
	},
	load: fileName => {
		let target;
		if (fileName) target = fileName;else target = defaultStateFileName;

		fs.readFile(target, 'utf8', (e, d) => {
			if (e) {
				console.error("Failed to load the state.\n" + "Creating new default one.");
				stateCon.make();
				return e;
			}
			loCon.updateSelector(-2);
			try {
				state = JSON.parse(d);
				if (typeof state === "string") state = JSON.parse(state);
				tl = stateCon.restoreTweets();
				tlOrder = state.tlOrder;
				tlCurrent = state.tlCurrent;
				stateFileName = target;
				console.log("Loaded the state.");
				for (let i = 0; i < tlOrder.length; i++) {
					tlCon.forceUpdate(tlOrder[i], 1);
				}
			} catch (e) {
				console.error("Failed parsing the state.\n" + "Does it succeed if you manually try parsing it with `JSON.parse('${fileName}')`?");
				console.log(e);
			}
			loCon.init();
			// DAMN
			let damn = setTimeout(function () {
				loCon.updateSelector(-3);
				clearTimeout(this);
			}, 3000);
		});
	},
	forceSave: (fileName, contentOfState, silent) => {
		// assert `contentOfState` is already in a JSON form.
		let target;
		if (fileName) target = fileName;else target = defaultStateFileName;
		let stateToSave;

		if (contentOfState) {
			stateToSave = contentOfState;
		} else {
			// overwrite the variable `state` below with the current state, which is used for saving and loading states.
			state = {
				width: Math.round(window.innerWidth / charWidth),
				height: Math.round(window.innerHeight / charHeight),
				tl: stateCon.storeTweets(),
				tlOrder: tlOrder,
				tlCurrent: tlCurrent
			};
			stateToSave = JSON.stringify(state);console.log(stateToSave);
		}

		fs.writeFile(target, stateToSave, 'utf8', e => {
			if (e) {
				console.error(`Failed saving current state!\n\
				Try manually copy the result with \`JSON.stringify(state)\` and save it as \`${ __dirname }/state/state.json\`.`);
				return e;
			}
			stateFileName = target;
			if (!silent) console.log("Saved the state.");
		});
	},
	backup: () => {
		fs.readFile(stateFileName, 'utf8', (e, d) => {
			// here I used two `e`. There must be a much clear and clever way to handle errors from multiple sources.
			if (e) {
				console.error("Failed loading the current state.\n" + "Manually backup the current state file and execute `stateCon.forceSave()` to overwrite your current state.");
				console.log(e);
				return e;
			}
			try {
				const timestamp = moment().format("YYMMDDHHmmss");
				stateCon.forceSave(`${ __dirname }/state/state${ timestamp }.json`, d);
				console.log(`Saved the current state in '${ __dirname }/state${ timestamp }.json'.`);
			} catch (e) {
				console.error("Failed making a backup of the current state.");
				console.log(e);
				return e;
			}
		});
	},
	save: fileName => {
		// what it does is backup the old state with a new file name, and save current state with the designated file name so you can get back to old one.
		let target;
		if (fileName) target = fileName;else target = defaultStateFileName;
		// save the old one loaded at the startup.
		stateCon.backup();
		// save the current state with the designated file name.
		stateCon.forceSave(target, "", 1);
		stateFileName = target;
	}
};
/*
`tl` contains name of tab, contents of tab with some other information combined as key-value pair.
 like
	"home":
	{
		type: "statuses/home_timeline",
    params: { property:value, property:value, ... },
		tweets: [twits, twits, twits, ...]]
	}
]
 */
let tl = {};
// valid argument on the need of this array though,
// that because you can just directly move the order of elements (in this case, tabs) and save the order at the end of the process and reload it at the startup.
let tlOrder = [];
let tlCurrent = 0;

let tlCon = {
	tab: {
		// that address should not be encouraged to be filled manually by users. it's the one listed in https://dev.twitter.com/rest/public.
		// that parameters also should not be encouraged to be filled manually by users. We will make a dictionary to refer for each of addresses and get needed ones to fill from.
		add: function (nameAndAddress, parameters, position) {
			let tabName, address;
			if (nameAndAddress.constructor === Array) {
				tabName = nameAndAddress[0];
				nameAndAddress[1] ? address = nameAndAddress[1] : "";
			} else {
				tabName = nameAndAddress;
				if (URI[nameAndAddress]) address = URI[nameAndAddress];else {
					console.error("Need to specify the URI.");
					return;
				}
			}
			if (!tl.hasOwnProperty(tabName) && typeof tabName !== "undefined" && tlOrder.indexOf(tabName) === -1) {
				let newTabFrame = {
					type: address,
					params: parameters,
					tweets: []
				};
				if (streamURI.hasOwnProperty(tabName)) newTabFrame.notifications = 0;
				tl[tabName] = newTabFrame;
				if (typeof position === "undefined") tlOrder.push(tabName);else tlOrder.splice(position, 0, tabName);
			}
			loCon.updateTabs();
			tlCon.update(tabName, 1);
		},
		remove: function (tabName, noUpdate) {
			//let tabToDelete;
			//if(tabName) tabToDelete = tabName;
			//else tabToDelete = tlOrder[tlCurrent];
			//console.log(tabName);
			//console.log(tabToDelete);
			delete tl[tabName];
			tlOrder.splice(tlOrder.indexOf(tabName), 1);
			if (tlOrder[tlCurrent - 1]) tlCurrent--;
			if (noUpdate) {} else {
				loCon.updateTabs();
				if (tlOrder.length !== 0) loCon.updateMain();
			}
		},
		flush: function (really) {
			if (really === "y" || really === "Y") for (var i in tl) tlCon.tab.remove(i, 1);
		},
		rename: function (tabName, alterName) {
			if (typeof tabName !== "undefined" && typeof alterName !== "undefined" && tl.hasOwnProperty(tabName) && !tl.hasOwnProperty(alterName) && tlOrder.indexOf(tabName) > -1 && tlOrder.indexOf(alterName) === -1) {
				let contents = tl[tabName];
				tl[alterName] = contents;
				tlOrder.splice(tlOrder.indexOf(tabName), 1, alterName);
				delete tl[tabName];
			}
			loCon.updateTabs();
		},
		reorder: function (tabName, place, swap) {
			if (typeof tabName !== "undefined") {
				if (typeof swap !== "undefined") {
					tlOrder.splice(place, 0, ...tlOrder.splice(tlOrder.indexOf(tabName), 1));
				} else {
					let placeSwap = tlOrder.indexOf(tabName);
					tlCon.tab.reorder(tabName, place);
					tlCon.tab.reorder(tlOrder[place - 1], placeSwap);
				}
			}
			loCon.updateTabs();
		}
	},
	recentCall: false,
	update: function (tabName, direction) {
		if (tlCon.recentCall) {} else if (direction) {
			let contents;
			if (tabName) contents = tl[tabName];else if (tl.hasOwnProperty("Home")) contents = tl["Home"];else {
				console.error("Specify the tab to update.");
				return;
			}

			tlCon.recentCall = true;
			let tweets = tl[tabName].tweets;
			let params = tl[tabName].params;

			//params.count = 20;
			// TODO make it check if the type can use `since_id` and `max_id` first.
			// TODO Fix it. This part doesn't catch current end of loaded tweets!
			switch (direction) {
				// case -1:
				// 	if(tweets[tweets.length-1])
				// 		params.max_id = tweets[tweets.length-1].id_str;
				// 	break;
				// case 1:
				// default:
				// 	if(tweets[0])
				// 		params.since_id = tweets[0].id_str;
				// 	break;
				case -1:
					if (tweets[tweets.length - 1]) {
						params.max_id = tweets[tweets.length - 1].id;
						delete params.since_id;
					}
					break;
				case 1:
				default:
					if (tweets[0]) {
						params.since_id = tweets[0].id;
						delete params.max_id;
					}
					break;
			}

			t.get(contents.type, params, function (err, data, response) {
				// TODO learn what errors and response are for.
				if (err) {
					if (tabName === tlOrder[tlCurrent]) {
						layout.main.appendChild(dobj("div", "error", err, []));
					}
					console.log(`An error occured while updating ${ tabName }.`);
					emitErrorMsgFromCode(err.code);
					return err;
				}
				/*TODO check if received data should attach to or replace the previous data.
    for some of the api address the `direction` is meaningless
    and the data received should replace old datas instead of attaching to it.
    but we're only testing for home, mention, user timeline at the moment
    so the default behavior will be adding the data to the old one.*/
				try {
					data = data.map(c => new display.twitObj(c));
					switch (direction) {
						case 1:
							tweets = data.concat(tweets);
							break;
						case -1:
							tweets.pop();
							tweets = tweets.concat(data);
							break;
						case 0:
							// for those which doesn't need previous datas?
							tweets = data;
							break;
					}
					contents.tweets = tweets;
					contents.params = params;
					tl[tabName] = contents;
					if (tlOrder[tlCurrent] === tabName) loCon.updateMain();
					tlCon.recentCall = false;
				} catch (e) {
					if (tabName === tlOrder[tlCurrent]) {
						// DAMN (2)
						let damn = setTimeout(function () {
							loCon.updateTabs("change", tlCurrent);
							clearTimeout(this);
						}, 2000);
					}
					console.log(`An error occured while updating ${ tabName }.`);
					console.log(e.stack);
				}
			}); // t.get
		} // if-else tlCon.recentCall
	}, // update
	forceUpdate: function (tabName, direction) {
		if (tlCon.recentCall) {
			tlCon.recentCall = false;
		}
		tlCon.update(tabName, direction);
	}
};

const emitErrorMsgFromCode = errCode => {
	switch (errCode) {
		case 215:
			console.log("Authentication tokens is not set right. Check `js/_twit.js` and update the token data.");
			break;
	}
};
