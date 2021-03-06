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

// Move an array element from one position to another
// http://stackoverflow.com/a/5306832/4972931
const moveInArray = function (arr, old_index, new_index) {
	while (old_index < 0) {
		old_index += arr.length;
	}
	while (new_index < 0) {
		new_index += arr.length;
	}
	if (new_index >= arr.length) {
		var k = new_index - arr.length;
		while (k-- + 1) {
			arr.push(undefined);
		}
	}
	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	return arr; // for testing purposes
};

const URI = {
	"mention": 'statuses/mentions_timeline',
	"user": 'statuses/user_timeline',
	"home": 'statuses/home_timeline',
	"rted": 'statuses/retweets_of_me',
	"dmsent": 'direct_messages/sent',
	"search": 'search/tweets',
	"dm": 'direct_messages',
	"l": 'lists/statuses'
};
const streamURI = {
	"filter": 'statuses/filter',
	"sample": 'statuses/sample',
	"user": 'user'
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
		cmdDict.addlist.d = cmdDict.al.d = cmdDict.al.d.substr(0, cmdDict.al.d.indexOf("Your lists:<br>") + 15) + l.map(v => v.slug + "<span> (" + v.description + ")</span>").join(", "); // the number is the length of the string put into the `indexOf`.
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
const doCommandFromLink = function (displayText, cmdQuery) {
	let theAnchor = dobj("span", "link", displayText, []);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor, theAnchor.indexOf(">"), theAnchor.indexOf(">") + 1, ` onclick='execute("${ cmdQuery }")'>`);
	return theAnchor;
};
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
	startnew: function () {
		stateCon.make();
	},
	resize: function (w, h) {
		window.resizeTo((w > 13 ? w : 13) * 8, (h > 6 ? h : 6) * 15 /*+25*/);
	},
	save: function (fileName) {
		stateCon.save(fileName ? fileName : "");
	},
	load: function (fileName) {
		stateCon.load(fileName ? fileName : "");
	},
	rs: function (w, h) {
		return this.resize(w, h);
	},
	w: function (f) {
		return this.save(f);
	},
	o: function (f) {
		return this.load(f);
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
				console.dir(e);
				return;
			}
			console.log("Composing succeed.");
			cmd.update();
			loCon.updateSelector(-1);
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
			loCon.updateSelector(-1);
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
			if (currentTweetId === d.id_str) {
				layout.main.removeChild(layout.main.children[layout.selectorPos]);
				tl[tlOrder[tlCurrent]].tweets.splice(layout.selectorPos, 1);
			}
		});
	},

	add: function (names, par, pos) {
		switch (names) {
			case "l":
			case "L":
				changeCmdQueryTo("addlist");
				break;
			case "user":
			case "User":
				changeCmdQueryTo("adduser");
				break;
			case "search":
			case "Search":
				changeCmdQueryTo("addsearch");
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
		tlCon.tab.add("l", p);
		tlCon.tab.rename("l", `${ lslug }`);
		let damn = setTimeout(function () {
			tlCon.tab.remove("l");
			clearTimeout(this);
		}, 2000);
	},
	adduser: function (sname) {
		let p = {
			screen_name: sname
		};
		tlCon.tab.add("user", p);
		tlCon.tab.rename("user", `@${ sname }`);
		let damn = setTimeout(function () {
			tlCon.tab.remove("user");
			clearTimeout(this);
		}, 2000);
	},
	addsearch: function (q) {
		let p = {
			q: q,
			result_type: "mixed"
		};
		tlCon.tab.add("search", p);
		tlCon.tab.rename("search", `${ q }`);
		let damn = setTimeout(function () {
			tlCon.tab.remove("search");
			clearTimeout(this);
		}, 2000);
	},
	a: function (n, p, po) {
		return this.add(n, p, po);
	},
	al: function (s, l) {
		return this.addlist(s, l);
	},
	au: function (s) {
		return this.adduser(s);
	},
	as: function (q) {
		return this.addsearch(q);
	},

	remove: function (tabName) {
		tlCon.tab.remove(tabName);
	},
	rename: function (tabName, alterName) {
		tlCon.tab.rename(tabName, alterName);
	},
	reorder: function (from, to, swap) {
		tlCon.tab.reorder(from, to, swap);
	},
	rm: function (tabName) {
		return this.remove(tabName);
	},
	rn: function (tn, an) {
		return this.rename(tn, an);
	},
	ro: function (fr, to, sw) {
		return this.reorder(fr, to, sw);
	},

	update: function (tabName, direction) {
		let tn, dr;
		if (tabName) {} else {
			tn = tlOrder[tlCurrent];
		}
		if (direction) {} else {
			dr = 1;
		}
		if (tl[tn].tweets) {
			tlCon.update(tn, dr);
		}
	},
	u: function (tabName, direction) {
		return this.update(tabName, direction);
	},
	about: function () {}
};
const cmdDict = {
	show: cmd => {
		if (cmdDict[cmd].p) {
			return `<div><div class="contextCmdDict">${ cmdDict[cmd].p }</div>${ cmdDict[cmd].d }</div>`;
		} else {
			return `<div>${ cmdDict[cmd].d }</div>`;
		}
	},

	startnew: {
		"d": "RESET EVERYTHING AND START AS A NEW INSTANCE."
	},
	resize: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	rs: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	save: {
		"p": "save( fileName)",
		"d": "Save current app state."
	},
	w: {
		"p": "save( fileName)",
		"d": "Save current app state."
	},
	load: {
		"p": "load( fileName)",
		"d": "Load the last saved(or specified) app state."
	},
	o: {
		"p": "load( fileName)",
		"d": "Load the last saved(or specified) app state."
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
		"d": "Retweet a tweet with the id. Omit id to retweet currently selected tweet."
	},
	del: {
		"p": "del( id)",
		"d": "Delete a tweet with the id. Omit id to delete currently selected tweet."
	},
	add: {
		"p": "add [nameOfTab(,URI)]( parameters position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name','URI'], or skip URI and just choose one from below:<BR>" + `${ getURIListInString() }<BR>` + "If you know what parameters are, you can add them as a form of an object.<BR>" + "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	a: {
		"p": "add [nameOfTab(,URI)]( parameters position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name','URI'], or skip URI and just choose one from below:<br>" + `${ getURIListInString() }<BR>` + "If you know what parameters are, you can add them as a form of an object.<BR>" + "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	addlist: {
		"p": "addlist screenName list-slug",
		// avblist:<br>_ <== index 182
		// <== indexOf("lists:<br>")+10
		"d": "Add a list with the list-slug, made by screenName. <br>" + "screenName is the twitter username, <br>" + "list-slug is the list name in lower-cases-alphabet-and-hyphens.<br>" + "Your lists:<br>" + "[]"
	},
	al: {
		"p": "addlist screenName list-slug",
		"d": "Add a list with the list-slug, made by screenName. <br>" + "screenName is the twitter username, <br>" + "list-slug is the list name in lower-cases-alphabet-and-hyphens.<br>" + "Your lists:<br>" + "[]"
	},
	adduser: {
		"p": "adduser screenName",
		"d": "Add a tab of specific user tweets. screenName is the twitter username of the user."
	},
	au: {
		"p": "adduser screenName",
		"d": "Add a tab of specific user tweets. screenName is the twitter username of the user."
	},
	addsearch: {
		"p": "addsearch query",
		"d": "Add a tab of specific search results."
	},
	as: {
		"p": "addsearch query",
		"d": "Add a tab of specific search results."
	},
	remove: {
		"p": "remove nameOfTab",
		"d": "Remove a tab with the name. To quickly close a tab, click 'X' at the end of the tab list, or in the top-right corner of the screen."
	},
	rm: {
		"p": "remove nameOfTab",
		"d": "Remove a tab with the name. To quickly close a tab, click 'X' at the end of the tab list, or in the top-right corner of the screen."
	},
	rename: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	rn: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	reorder: {
		"p": "reorder oldIndex newIndex swap",
		"d": "Move a tab in oldIndex to newIndex. If swap is true(anything considered as true in javascript is okay), only move two tabs, one in oldIndex and the other in newIndex."
	},
	ro: {
		"p": "reorder oldIndex newIndex swap",
		"d": "Move a tab in oldIndex to newIndex. If swap is true(anything considered as true in javascript is okay), only move two tabs, one in oldIndex and the other in newIndex."
	},
	update: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets."
	},
	u: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets"
	},
	about: {
		"d": "&copy; 2016 Dinir Nertan<br>" + `${ newLinkAnchor(["dinir.works", "http://dinir.works"]) }<br>` + `${ newLinkAnchor(["github.com/Dinir/Text-Transmitter", "https://github.com/Dinir/Text-Transmitter"]) }`
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
let navigatingThroughTweets = true;
let lastKeyCode = 0;
let tToReply = ""; // tweet to reply
let iToReply = ""; // id to reply
let oToReply = ""; // others to reply (people mentioned in tweets)
let currentCmdInQuery;
let currentTweetId; // handled in displayLayout.js and this file. Each handles keyboard movement cases and mouse click cases.
let cmdContextText, cmdContextRightText;
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
	//console.log(`${e.type} ${e.keyCode} ${e.code} ${e.charCode}`);
	//e.preventDefault();
	const query = document.getElementById("query");

	// scroll a page when presses 'PgUp/Dn'
	if (e.keyCode === 33 || e.keyCode === 34) {
		document.body.scrollTop += (e.keyCode === 33 ? -1 : 1) * (window.innerHeight - charHeight - layout.tabs.getBoundingClientRect().height);
		// console.log(
		// 	window.innerHeight-charHeight-layout.tabs.getBoundingClientRect().height
		// );
	}

	// scroll to the end when presses 'Home/End'

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

		// reply & quote
		if (e.keyCode === 79) {
			if (!e.shiftKey) {
				tToReply = layout.main.children[layout.selectorPos].id;
				iToReply = layout.main.children[layout.selectorPos].getElementsByClassName("username")[0].innerHTML;
				oToReply = layout.main.children[layout.selectorPos].getElementsByClassName("text")[0].innerHTML.match(/@\w+/g);
				if (oToReply) {
					oToReply = (oToReply.join(" ") + " ").replace(`@${ myName } `, "");
				} else {
					oToReply = "";
				}
				changeCmdQueryTo(`reply ${ tToReply } @${ iToReply } ${ oToReply }`);
				let d = setTimeout(function () {
					query.value = query.value.substring(0, query.value.length - 2);
					clearTimeout(d);
				}, 10);
			} else if (e.shiftKey) {
				const tToQuote = layout.main.children[layout.selectorPos].getElementsByClassName("timestamp")[0].outerHTML.match(/(https.+)&quot\;\)\"\>/)[1];
				changeCmdQueryTo(`compose ` + ` ${ tToQuote }`);
				let d = setTimeout(function () {
					query.value = query.value.substring(0, query.value.length - 1);
					query.setSelectionRange(9, 9);
					clearTimeout(d);
				}, 10);
			}
		}

		// retweet
		if (e.keyCode === 82) {
			if (e.ctrlKey && !e.shiftKey) {
				stateCon.save();
				location.reload();
			}
			if (e.shiftKey) {
				cmd["retweet"](currentTweetId);
			}
		}

		// del
		if (e.keyCode === 68) {
			if (e.shiftKey) {
				cmd["del"](currentTweetId);
			}
		}

		// update current tab
		if (e.keyCode === 85) {
			if (!e.shiftKey) {
				cmd["update"]();
			} else if (e.shiftKey) {
				const curScr = document.body.scrollTop;
				// cmd.update(tlOrder[tlCurrent], -1);
				tlCon.update(tlOrder[tlCurrent], -1);
				let scrBack = setTimeout(function () {
					window.scrollTo(0, curScr);
					loCon.updateScroll();
					clearTimeout(scrBack);
				}, 1300);
			}
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

	if (event.clientY < layout.tabs.getBoundingClientRect().height) {
		// clicked tabs line
		if (event.target.id.match(/tab\d+/)) {
			// clicked a tab
			loCon.updateTabs("change", parseInt(event.target.id.match(/\d+/)));
		} else if (event.target.id === "close") {
			// clicked the close button
			loCon.updateTabs("close");
		}
	}
	if (event.clientY > layout.tabs.getBoundingClientRect().height && event.clientY < window.innerHeight - charHeight) {
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
		if (theTweet) {
			const id = theTweet.id;
			let order = 0;
			while ((theTweet = theTweet.previousSibling) !== null) order++;
			loCon.updateSelector(-2);
			layout.selectorPos = order;
			loCon.updateSelector(2);
			return id;
		} else {
			return;
		}
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
		// if tab line height changes, set margin of main respecting that. (so its first line isn't hidden behind tab line)
		if (layout.main && layout.tabs) layout.main.style.marginTop = layout.tabs.getBoundingClientRect().height;
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
			const scrollPos = parseInt(document.body.scrollTop / (layout.main.clientHeight - (window.innerHeight - charHeight - layout.tabs.getBoundingClientRect().height)) * 10000) / 100 + "%";
			// update older tweets when reaches the bottom or first 20 tweets don't reach the bottom
			if (scrollPos === "100%" || layout.main.clientHeight <= window.innerHeight - charHeight - layout.tabs.getBoundingClientRect().height) {
				layout.currentLine.innerHTML = "Bot";
				// const curScr = document.body.scrollTop;
				// tlCon.update(tlOrder[tlCurrent], -1);
				// let scrBack = setTimeout(function(){
				// 	window.scrollTo(0,curScr);
				// 	loCon.updateScroll();
				// 	clearTimeout(scrBack)
				// },1300);
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
		let isReply = raw.in_reply_to_user_id_str || raw.in_reply_to_status_id_str;
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
							//let addedText = text.replace(`#${ci.text}`, newLinkAnchor([`#${ci.text}`,`https://twitter.com/hashtag/${ci.text}?src=hash`]));
							let addedText = text.replace(`#${ ci.text }`, clickableCmdCandidate('addsearch', `#${ ci.text }`));
							text = addedText;
							break;
						case "QT":
							//let addedTextQT = textQuote.replace(`#${ci.text}`, newLinkAnchor([`#${ci.text}`,`https://twitter.com/hashtag/${ci.text}?src=hash`]));
							let addedTextQT = textQuote.replace(`#${ ci.text }`, clickableCmdCandidate('addsearch', `#${ ci.text }`));
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
							//let addedText = text.replace(`@${ci.screen_name}`, newLinkAnchor([`@${ci.screen_name}`,`https://twitter.com/${ci.screen_name}`]));
							let addedText = text.replace(`@${ ci.screen_name }`, clickableCmdCandidate('adduser', `${ ci.screen_name }`, `@${ ci.screen_name }`));
							text = addedText;
							break;
						case "QT":
							//let addedTextQT = textQuote.replace(ci.url, newLinkAnchor([`@${ci.screen_name}`,`https://twitter.com/${ci.screen_name}`]));
							let addedTextQT = textQuote.replace(`@${ ci.screen_name }`, clickableCmdCandidate('adduser', `${ ci.screen_name }`, `@${ ci.screen_name }`));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for mentions
		let doesPing = text.match(`@${ myName }`);

		if (text.match("<br>") && textQuote.match("<br>")) {} else {
			text = convertLineBreaks(text);
			if (textQuote) textQuote = convertLineBreaks(textQuote);
		}

		const dom = dobj("div", ["twitObj", id], "", [dobj("span", "rawTS", timestamp.format(), [], "style", "display:none;"), clickableTimestamp(timestamp, username, id),
		//tsDom,
		//dobj("span","timestamp",simplifyTimestamp(timestamp)),
		clickableUserDom(username, isReply, doesPing), dobj("div", "text", text)]);
		if (isQuote && (raw.quoted_status || raw.retweeted_status && raw.retweeted_status.quoted_status)) {
			dom.appendChild(dobj("span", "quote", "", [dobj("span", "rawTS", timeQuote.format(), [], "style", "display:none;"), clickableTimestamp(timeQuote, userQuote, id),
			//dobj("span","timestamp",simplifyTimestamp(timeQuote)),
			//dobj("span","username",userQuote),
			clickableUserDom(userQuote), dobj("div", "text", textQuote)]));
		}
		if (isRetweet) {
			dom.appendChild(dobj("span", "retweet", "", [dobj("span", "rawTS", timeRTed.format(), [], "style", "display:none;"),
			// dobj("span","username",userRTed),
			clickableUserDom(userRTed), clickableTimestamp(timeRTed, userRTed, id)
			//dobj("span","timestamp",simplifyTimestamp(timeRTed))
			]));
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

// make it so clicking timestamp opens tweet page in host's web browser. the code below is the timestamp that can be clicked.
const clickableTimestamp = function (timestamp, uname, id) {
	const tw = document.createElement("span");
	tw.innerHTML = newLinkAnchor([simplifyTimestamp(timestamp), `https://twitter.com/${ uname }/status/${ id }`]);
	tw.firstChild.className = "timestamp";
	return tw.firstChild;
};
// make it so clicking username opens a tab of tweets of that user.
const clickableUserDom = function (uname, isReply, doesPing) {
	const uw = document.createElement("span");
	uw.innerHTML = doCommandFromLink(uname, `:adduser ${ uname }`);
	uw.firstChild.className = `username${ isReply ? " reply" : "" }${ doesPing ? " ping" : "" }`;
	return uw.firstChild;
};

const clickableCmdCandidate = function (cmd, content, displayAs) {
	const ew = document.createElement("span");
	ew.innerHTML = doCommandFromLink(displayAs ? displayAs : content, `:${ cmd } ${ content }`);
	return ew.innerHTML;
};
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
	getLists();
};

// window.onbeforeunload = () => {
// 	stateCon.save();
// };
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
let stateFileName = `./state/state.json`;
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
		tlCon.tab.add("mention", {});
		tlCon.tab.add("home", {});
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
				console.dir(e);
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
		if (fileName) target = `${ __dirname }/state/${ fileName }.json`;else target = defaultStateFileName;

		fs.readFile(target, 'utf8', (e, d) => {
			if (e) {
				console.error("Failed to load the state.");
				if (t) {
					console.log("Creating new default one.");
					stateCon.make();
				}
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
				console.error("Failed parsing the state.\n" + "Does it succeed if you manually try parsing it with `JSON.parse(fileName)`?");
				console.dir(e);
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
		if (fileName) {
			target = fileName;
		} else target = defaultStateFileName;
		let stateToSave;

		if (contentOfState) {
			stateToSave = contentOfState;
		} else {
			// wipe stored tweets, max_id, since_id
			// sometimes those ids makes nothing to be loaded
			for (var tab in tl) {
				if (tl.hasOwnProperty(tab)) {
					tl[tab].tweets = [];
					if (tl[tab].params.hasOwnProperty("since_id")) {
						delete tl[tab].params.since_id;
					}
					if (tl[tab].params.hasOwnProperty("max_id")) {
						delete tl[tab].params.max_id;
					}
				}
			}
			// overwrite the variable `state` below with the current state, which is used for saving and loading states.
			state = {
				width: Math.round(window.innerWidth / charWidth),
				height: Math.round(window.innerHeight / charHeight),
				tl: stateCon.storeTweets(),
				tlOrder: tlOrder,
				tlCurrent: tlCurrent
			};
			stateToSave = JSON.stringify(state);
		}

		fs.writeFile(target, stateToSave, 'utf8', e => {
			if (e) {
				console.error(`Failed saving current state!\n` + `Try manually copy the state with \`JSON.stringify(state)\` and save it as \`${ fileName }\`.`);
				return e;
			}
			stateFileName = target;
			if (!silent) console.log("Saved the state.");
		});
	},
	/*
 	backup: () => {
 		fs.readFile(stateFileName,'utf8',(e,d) => {
 			// here I used two `e`. There must be a much clear and clever way to handle errors from multiple sources.
 			if(e) {
 				console.error("Failed loading the current state.\n" +
 				              "Manually backup the current state file and execute `stateCon.forceSave()` to overwrite your current state.");
 				console.dir(e);
 				return e;
 			}
 			try {
 				const timestamp = moment().format("YYMMDDHHmm");
 				stateCon.forceSave(`${__dirname}/state/state${timestamp}.json`, d);
 				console.log(`Saved the last state in 'state${timestamp}.json'.`);
 			} catch(e) {
 				console.error("Failed making a backup of the current state.");
 				console.dir(e);
 				return e;
 			}
 		});
 	},
 */
	save: fileName => {
		// what it does is backup the old state with a new file name, and save current state with the designated file name so you can get back to old one.
		let target;
		if (fileName) target = `${ __dirname }/state/${ fileName }.json`;else target = defaultStateFileName;
		// save the old one loaded at the startup.
		// stateCon.backup();
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
					params: parameters ? parameters : {},
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
			if (tlOrder.indexOf(tabName) !== -1) {
				if (tlOrder[tlCurrent] === tabName && !tlOrder[tlCurrent + 1]) {
					tlCurrent--;
				}
				tlOrder.splice(tlOrder.indexOf(tabName), 1);
				if (noUpdate) {} else {
					loCon.updateTabs();
					if (tlOrder.length !== 0) loCon.updateMain();
				}
			}
			if (tl[tabName]) {
				delete tl[tabName];
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
		reorder: function (fromIndex, toIndex, swap) {
			const beforePos = tlOrder[tlCurrent];
			if (typeof fromIndex !== "undefined" && typeof toIndex !== "undefined") {
				let fr, to;
				if (parseInt(fromIndex) >= 0) {
					// if fromIndex is number
					if (fromIndex < 0) fr = 0;else if (fromIndex >= tlOrder.length) fr = tlOrder.length - 1;else fr = fromIndex;
				} else {
					// if fromIndex is string
					fr = tlOrder.indexOf(fromIndex);
				}
				if (parseInt(toIndex) >= 0) {
					// if toIndex is number
					if (toIndex < 0) to = 0;else if (toIndex >= tlOrder.length) to = tlOrder.length - 1;else to = toIndex;
				} else {
					// if toIndex is string
					to = tlOrder.indexOf(toIndex);
				}
				if (fr !== to && fr !== -1 && to !== -1) {
					if (typeof swap !== "undefined") {
						const tt = tlOrder[fr];
						tlOrder[fr] = tlOrder[to];
						tlOrder[to] = tt;
					} else {
						moveInArray(tlOrder, fr, to);
					}
				}
			}
			const currentViewChanged = tlCurrent !== tlOrder.indexOf(beforePos);
			if (currentViewChanged) {
				tlCurrent = tlOrder.indexOf(beforePos);
			}
			loCon.updateTabs();
			if (!currentViewChanged) {
				loCon.updateMain();
			}
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
			let tweets = contents.tweets;
			let params = contents.params;

			//params.count = 20;
			// TODO make it check if the type can use `since_id` and `max_id` first.
			switch (direction) {
				case -1:
					if (tweets[tweets.length - 1]) {
						params.max_id = tweets[tweets.length - 1].id;
					}
					if (params.hasOwnProperty("since_id")) {
						delete params.since_id;
					}
					break;
				case 1:
				default:
					if (tweets[0]) {
						params.since_id = tweets[0].id;
					}
					if (params.hasOwnProperty("max_id")) {
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
					// it returns true when it can't find the code in itself.
					if (emitErrorMsgFromCode(err.code)) {
						if (err.message) alert(err.message);
						console.dir(err);
					}
					return;
				}
				/*TODO check if received data should attach to or replace the previous data.
    for some of the api address the `direction` is meaningless
    and the data received should replace old datas instead of attaching to it.
    but we're only testing for home, mention, user timeline at the moment
    so the default behavior will be adding the data to the old one.*/
				try {
					switch (contents.type) {
						case "search/tweets":
							data = data.statuses.map(c => new display.twitObj(c));
							break;
						default:
							data = data.map(c => new display.twitObj(c));
							break;
					}
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
		default:
			return true;
			break;
	}
};
