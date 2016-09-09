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
		for (let i in arguments) newOne.appendChild(arguments[i]);
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
	if (firstCl) {
		if (!secondCl) {
			target.className += ` ${ firstCl }`;
		} else {
			target.className = firstCl === "*" ? secondCl : target.className.replace(new RegExp('\\s?' + firstCl), secondCl);
		}
	}
};
const replaceDobj = (to, from) => {
	from.parentNode.replaceChild(to, from);
};
let cmd = {
	resize: function (w, h) {
		window.resizeTo(w * 8, h * 15 + 25);
	},
	rs: function (w, h) {
		return this.resize(w > 13 ? w : 13, h > 6 ? h : 6);
	},

	add: function (name, uri, pos) {}
};
function execute(command) {
	let prefix = command.slice(0, 1);
	let argv = command.trim().substr(1).split(" ");
	cmd[argv.shift()](...argv);
}
//import {execute} from "./commandHandler.js";

// Shift Ctrl Alt 16 17 18
// or, use e.shiftKey/ctrlKey/altKey
// PgUp PgDn End Home 33 34 35 36
// a-z 65-90
// ; 186
// Backspace 8


let receivingCommand = false;
let lastKeyCode = 0;

function keyPress(e) {
	lastKeyCode = e.keyCode;
	console.log(`${ e.type } ${ e.keyCode } ${ e.code } ${ e.charCode }`);
	//e.preventDefault();
	const query = document.getElementById("query");

	// scroll a page when presses 'PgUp/Dn'
	if (e.keyCode === 33 || e.keyCode === 34) {
		document.body.scrollTop += (e.keyCode === 33 ? -1 : 1) * (window.innerHeight - 2 * charHeight);
	}

	if (!receivingCommand) {
		// when the buffer is closed
		// ':' or '/' to open buffer
		if (e.shiftKey && e.keyCode === 186 || e.keyCode === 191) ctl.toggleCommand();
	} else {
		// when the buffer is open

		// 'esc' or 'enter' to close buffer.
		if (e.keyCode === 27 || e.keyCode === 13) {
			if (e.keyCode === 13) execute(query.value);
			ctl.toggleCommand();
		}
	}
}

function checkStates() {
	const query = document.getElementById("query");
	// 'backspace' or 'delete' to empty the buffer to close it
	if (lastKeyCode === 8 || lastKeyCode === 46 && query.value.length === 0) ctl.toggleCommand();
}

// it toggles what the bottom line shows every time it's invoked.
const ctl = {
	toggleCommand: () => {
		const query = document.getElementById("query");
		const status = document.getElementById("status");
		const commandInput = document.getElementById("commandInput");
		if (receivingCommand) {
			// should I be able to define variables and use them instead of invoking all these querySelectors every time?
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
	return false;
};


let commandContextDom = dobj("div", "left", "");
commandContextDom.rightText = dobj("div", "rightText", "");
commandContextDom.appendChild(commandContextDom.rightText);
// layout controller.
const loCon = {
	init: () => {
		const wrapper = dobj("article", "", "", []);
		const tabs = new display.tabObj(tlOrder);
		const main = null;
		const controls = dobj("section", [, "controls"], "", [dobj("div", [, "status"], "", [dobj("div", "left", "&nbsp;"), dobj("div", "rightText", "", [dobj("span", "", "&nbsp;", [], "style", "width: 8px;"), dobj("span", [, "currentLine"], "0%"), dobj("span", [, "api"], "")])]), dobj("div", [, "commandInput"], "", [dobj("div", [, "commandContext"], "", [commandContextDom]), dobj("input", [, "query"], "", [], "type", "text")])]);
		// this is a placeholder. :(
		const imgView = dobj("section", [, "imgView"], "", [dobj("div", "", "", [dobj("img")])]);
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
		let hasImage = typeof raw.entities.media !== "undefined";
		let hasLink = raw.entities.urls.length > 0;

		// data I should produce
		let doesPing = false;
		let repliedTo = ['', '']; // type(username?status?), address

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
				// it'll do the multiple quote tweet display.
				/*} else if(raw.entities.urls.length !== 0) {
    	const urls = raw.entities.urls;
    	const isItStatusUrl = /https:\/\/twitter.com\/.*\/status\/\d*/ /*;
                                                                    if(urls.map(function(o){return o.expanded_url}).join().search(isItStatusUrl) !== -1) {
                                                                    timeQuote = [];
                                                                    userQuote = [];
                                                                    textQuote = [];
                                                                    for(let i = 0; i<urls.length; i++) {
                                                                    }
                                                                    }
                                                                    */
			}
		}
		if (hasImage) {
			// let images = raw.extended_entities.media.map(function(v) {
			// 	manipulationIndices.push([...v.indices,]);
			// 	return {
			// 		indices:v.indices,
			// 		url:v.media_url_https
			// 	}
			// });
			// raw.extended_entities.media.forEach(
			// 	v => {
			// 		manipulationIndices.push([
			// 			...v.indices,
			// 			(
			// 				1
			// 			)
			// 		]);
			// 	}
			// );
		}
		if (hasLink) {}

		const dom = dobj("div", ["twitObj", id], "", [dobj("span", "timestamp", simplifyTimestamp(timestamp)), dobj("span", `username${ isReply ? " reply" : "" }${ doesPing ? " ping" : "" }`, username), dobj("pre", "text", text)]);
		if (isQuote && (raw.quoted_status || raw.retweeted_status && raw.retweeted_status.quoted_status)) {
			dom.appendChild(dobj("span", "quote", "", [dobj("span", "timestamp", simplifyTimestamp(timeQuote)), dobj("span", "username", userQuote), dobj("pre", "text", textQuote)]));
		}
		if (isRetweet) {
			dom.appendChild(dobj("span", "retweet", "", [dobj("span", "username", userRTed), dobj("span", "timestamp", simplifyTimestamp(timeRTed))]));
		}

		return dom;
	},
	tabObj: function (tlOrder) {
		let dom = dobj("section", ["hl", "tabs"], "");
		let notis = tlOrder.map(v => tl.get(v).notifications);
		dom.tabs = [];
		dom.init = function () {
			for (let i = 0; i < tlOrder.length; i++) {
				if (notis[i]) {
					let nt = dobj("span", [i === tlCurrent ? "chosen" : "", `tab${ i }`], "", [dobj("span", [], notis[i])]);
					nt.innerHTML += `[${ tlOrder[i] }]`;
					dom.tabs.push(nt);
				} else {
					dom.tabs.push(dobj("span", [i === tlCurrent ? "chosen" : "", `tab${ i }`], `[${ tlOrder[i] }]`));
				}
			}
			dom.tabs.push(dobj("span", [, "close"], "X"));
			dom.appendChildren(...dom.tabs);
			document.body.firstElementChild.replaceChild(dom, document.getElementById("tabs"));
		};
		dom.updateNotification = function () {};
		const updateCurrentTab = newTab => {
			if (newTab.id.includes("tab")) {
				// clicked a tab = changing current tab
				const newNum = parseInt(newTab.id.match(/\d+/));
				if (tlCurrent !== newNum) {
					let tabs = document.getElementById("tabs").children;
					changeClass(tabs[tlCurrent], "chosen", "");
					changeClass(tabs[newNum], "chosen");
					tlCurrent = newNum;
				}
			} else if (newTab.id === "close") {
				// clicked the X = closing current tab
			}
		};
		dom.addEventListener('click', function () {
			updateCurrentTab(window.event.target);
		});
		return dom;
	}
};

/*
test script:

var twitDoms = []; var twts = []; t.get('statuses/user_timeline', {}, function(e,d,r){ twts=d; for(var i=0;i<twts.length;i++) twitDoms[i] = new display.twitObj(twts[i]); console.log('done'); });
*/


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
const fs = require('fs');

let state = {};
let stateFileName;
const charWidth = 8;
const charHeight = 15;
const stateCon = {
	make: () => {
		tlCon.tab.flush("Y");
		tlCon.tab.add("Mention", {});
		tlCon.tab.add("Home", {});
		tlCurrent = 1;
		const defaultState = JSON.stringify({
			"width": 80,
			"height": 24,
			"tl": Array.from(tl),
			"tlOrder": tlOrder,
			"tlCurrent": tlCurrent
		});
		fs.writeFile("./state.json", defaultState, e => {
			if (e) {
				console.error("Failed creating the default one.\n" + "Any new changes made in this session won't be saved.");
				return e;
			}
			stateFileName = "./state.json";
			console.log("Created the default state.");
		});
	},
	load: fileName => {
		let target;
		if (fileName) target = fileName;else target = "./state.json";

		fs.readFile(target, (e, d) => {
			if (e) {
				console.error("Failed to load the state.\n" + "Creating new default one.");
				stateCon.make();
				return e;
			}
			try {
				// It actually copies the references of the values obtained from JSON. It's great, but I'm not sure if it's okay to keep, as it's not intended at first.
				state = JSON.parse(d);
				state.tl = new Map(state.tl);
				tl = state.tl;
				tlOrder = state.tlOrder;
				tlCurrent = state.tlCurrent;
				stateFileName = target;
				console.log("Loaded the state.");
			} catch (e) {
				console.error("Failed parsing the state.\n" + "Does it succeed if you manually try parsing it with `JSON.parse()`?");
			}
		});
	},
	forceSave: (fileName, contentOfState) => {
		// assert `contentOfState` is already in a JSON form.
		let target;
		if (fileName) target = fileName;else target = "./state.json";
		let stateToSave;

		/* TODO: I might want to change from Map to just Object if I come to the point that this map converting isn't working anymore.
  `tl` is a Map, and I use `Array.from()` to convert it to a format that `JSON.stringify` can be applied.
  It's only valid when the keys and values are serialisable.
  See: http://stackoverflow.com/questions/28918232/how-do-i-persist-a-es6-map-in-localstorage-or-elsewhere/35078054#35078054 . */
		if (contentOfState) {
			stateToSave = contentOfState;
		} else {
			// overwrite the variable `state` below with the current state, which is used for saving and loading states.
			// TODO: while converting `tl` to a array, it lost every tweet it contains. Would there be a good way to convert an array of HTMLDivElement to a string, and get it back to original HTMLDivElement?
			state = {
				width: Math.round(window.innerWidth / charWidth),
				height: Math.round(window.innerHeight / charHeight),
				tl: Array.from(tl),
				tlOrder: tlOrder,
				tlCurrent: tlCurrent
			};
			stateToSave = JSON.stringify(state);
		}

		fs.writeFile(target, stateToSave, e => {
			if (e) {
				console.error("Failed saving current state!\n\
				Try manually copy the result with `JSON.stringify(state)`");
				return e;
			}
			stateFileName = target;
			console.log("Saved the state.");
		});
	},
	backup: () => {
		fs.readFile(stateFileName, (e, d) => {
			// here I used two `e`. There must be a much clear and clever way to handle errors from multiple sources.
			if (e) {
				console.error("Failed loading the current state.\n" + "Manually backup the current state file and execute `stateCon.forceSave()` to overwrite your current state.");
				return e;
			}
			try {
				const timestamp = moment().format("YYMMDDHHmmss");
				stateCon.forceSave(`./state${ timestamp }.json`, d);
				console.log(`Saved the current state in 'state${ timestamp }.json'.`);
			} catch (e) {
				console.error("Failed making a backup of the current state.");
				return e;
			}
		});
	},
	save: fileName => {
		// what it does is backup the old state with a new file name, and save current state with the designated file name so you can get back to old one.
		let target;
		if (fileName) target = fileName;else target = "./state.json";
		// save the old one loaded at the startup.
		stateCon.backup();
		// save the current state with the designated file name.
		stateCon.forceSave(target);
		stateFileName = target;
	}
};
let twts = [];
fs.readFile('./twts.txt', (e, d) => {
	if (e) throw e;twts = JSON.parse(d);
});
let twitDoms = [];
let conv = function () {
	for (var i = 0; i < twts.length; i++) twitDoms[i] = new display.twitObj(twts[i]);
	console.log('done');
};
let attach = function () {
	for (let i = 0; i < twitDoms.length; i++) document.getElementById("main").appendChild(twitDoms[i]);
};
let Twit = require('twit');
const
//ck  = "xnUHcbRQGzwW1X0eeq2tonOvO",
//cks = "gHhGwNK4pjdNVq9qRgZM5yFSLLr92AnrzsTPJZVxR0I74HAwKJ";
ck = "adyOv8nxxNwe4q7MdoAsLTgV8",
      cks = "GUZIeiN6HNWN23JlCiR9HwrUhvAbMNEJasj7UWlwp5NKiDQY00";
const
//at = "990651260-YngPXwEFJvSSILGSgtiBOzq0X1VECs3gEfDTINB7",
//ats = "AoAhBNkawjH93yFD0erDw8nbjecHPQOeTvp2IOpN5sXdi";
at = "712975464332075008-SSkhEdwP1fPPlh1sxy3LCggliOTIzjs",
      ats = "TUZkw1GxHBpCHdJq7X1SsPCnOEqCyfUceAC2ss5iR1pWP";

let t = new Twit({
	consumer_key: ck,
	consumer_secret: cks,
	access_token: at,
	access_token_secret: ats,
	timeout_ms: 30 * 1000
});
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
let tl = new Map();
// valid argument on the need of this array though,
// that because you can just directly move the order of elements (in this case, tabs) and save the order at the end of the process and reload it at the startup.
let tlOrder = [];
let tlCurrent = 0;

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
				if (URI[nameAndAddress]) address = URI[nameAndAddress];else console.error("Need to specify the URI.");
			}
			if (!tl.has(tabName) && typeof tabName !== "undefined" && tlOrder.indexOf(tabName) === -1) {
				let newTabFrame = {
					type: address,
					params: parameters,
					tweets: []
				};
				if (streamURI.hasOwnProperty(tabName)) newTabFrame.notifications = 0;
				tl.set(tabName, newTabFrame);
				if (typeof position === "undefined") tlOrder.push(tabName);else tlOrder.splice(position, 0, tabName);
			}
		},
		remove: function (tabName) {
			tl.delete(tabName);
			tlOrder.splice(tlOrder.indexOf(tabName), 1);
		},
		flush: function (really) {
			if (really === "y" || really === "Y") tl.forEach(function (v, k) {
				tlCon.tab.remove(k);
			});
		},
		rename: function (tabName, alterName) {
			if (typeof tabName !== "undefined" && typeof alterName !== "undefined" && tl.has(tabName) && !tl.has(alterName) && tlOrder.indexOf(tabName) > -1 && tlOrder.indexOf(alterName) === -1) {
				let contents = tl.get(tabName);
				tl.set(alterName, contents);
				tlOrder.splice(tlOrder.indexOf(tabName), 1, alterName);
				tl.delete(tabName);
			}
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
		}
	},
	recentCall: false,
	update: function (tabName, direction) {
		if (tlCon.recentCall) {} else if (direction) {
			let contents;
			if (tabName) contents = tl.get(tabName);else if (tl.has("Home")) contents = tl.get("Home");else {
				console.error("Specify the tab to update.");
				return;
			}

			tlCon.recentCall = true;
			let tweets = contents.tweets;
			let params = contents.params;

			// TODO make it check if the type can use `since_id` and `max_id` first.
			switch (direction) {
				case 1:
					if (tweets[0]) params.since_id = tweets[0].id_str;
					break;
				case -1:
					if (tweets[tweets.length - 1]) params.max_id = tweets[tweets.length - 1].id_str;
					break;
			}

			t.get(contents.type, params, function (err, data, response) {
				// TODO learn what errors and response are for.
				/*TODO check if received data should attach to or replace the previous data.
    for some of the api address the `direction` is meaningless
    and the data received should replace old datas instead of attaching to it.
    but we're only testing for home, mention, user timeline at the moment
    so the default behavior will be adding the data to the old one.*/
				data = data.map(c => new display.twitObj(c));
				switch (direction) {
					case 1:
						contents.tweets = data.concat(tweets);
						break;
					case -1:
						contents.tweets.pop();
						contents.tweets = tweets.concat(data);
						break;
					case 0:
						// for those which doesn't need previous datas?
						contents.tweets = data;
						break;
				}
				tl.set(tabName, contents);
				tlCon.recentCall = false;
			}); // t.get
		} // if-else tlCon.recentCall
	} // update
};
