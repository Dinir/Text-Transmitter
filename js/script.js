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
		window.resizeTo(w * 8, h * 15 /*+25*/);
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
let navigatingThroughTweets = true;
let lastKeyCode = 0;
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
		}
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
	}

	if (!receivingCommand) {
		// when the buffer is closed
		// ':' or '/' to open buffer
		if (e.shiftKey && e.keyCode === 186 || e.keyCode === 191) {
			ctl.toggleCommand();
			navigatingThroughTweets = !navigatingThroughTweets;
		}
		// if pressed arrow keys
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
	} else {
		// when the buffer is open

		// 'esc' or 'enter' to close buffer.
		if (e.keyCode === 27 || e.keyCode === 13) {
			if (e.keyCode === 13) execute(query.value);
			ctl.toggleCommand();
			navigatingThroughTweets = !navigatingThroughTweets;
		}
	}
}

function checkStates() {
	const query = document.getElementById("query");
	// 'backspace' or 'delete' to empty the buffer to close it
	if ((lastKeyCode === 8 || lastKeyCode === 46) && query.value.length === 0) ctl.toggleCommand();
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
	console.log(event);

	if (event.clientY < 15) {
		// clicked tabs line
		if (event.target.id.match(/tab\d+/)) {
			// clicked a tab
			loCon.updateTabs("change", parseInt(event.target.id.match(/\d+/)));
		} else if (event.target.id === "close") {
			// clicked the close button
			loCon.updateTabs("close");
		}
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
		loCon.updateSelector();
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
		switch (direction) {
			case 1:
				// going up
				if (layout.selectorPos > 0) {
					changeClass(layout.main.children[layout.selectorPos--], "cursor", " ");
					changeClass(layout.main.children[layout.selectorPos], "cursor");
				}
				break;
			case -1:
				// going down
				if (layout.selectorPos < tl[tlOrder[tlCurrent]].tweets.length - 1) {
					changeClass(layout.main.children[layout.selectorPos++], "cursor", " ");
					changeClass(layout.main.children[layout.selectorPos], "cursor");
				}
				break;
			case -2:
				// remove current selector indicatior
				if (layout.main && layout.main.children) changeClass(layout.main.children[layout.selectorPos], "cursor", " ");
				break;
			case -3:
				// remove selector through loop
				if (layout.main && layout.main.children) {
					for (let i in layout.main.children) {
						if (layout.main.children[i].className) changeClass(layout.main.children[i], "cursor", " ");
					}
				}
				break;
			default:
				// keep the position between tabs
				// changeClass(layout.main.children[layout.selectorPos], "cursor", " ");
				if (layout.selectorPos >= tl[tlOrder[tlCurrent]].tweets.length) {
					layout.selectorPos = tl[tlOrder[tlCurrent]].tweets.length != 0 ? tl[tlOrder[tlCurrent]].tweets.length - 1 : 0;
				}
				changeClass(layout.main.children[layout.selectorPos], "cursor");
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
			if (scrollPos === "100%") layout.currentLine.innerHTML = "BOT";else layout.currentLine.innerHTML = scrollPos;
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

		// check image/link/hashtag/mention
		let hasImage = hasImageInRT = hasImageInQT = hasLink = hasLinkInRT = hasLinkInQT = hasHashtag = hasHashtagInRT = hasHashtagInQT = hasMention = hasMentionInRT = hasMentionInQT = false;
		let images = links = hashtags = mentions = imagesInRT = linksInRT = hashtagsInRT = mentionsInRT = imagesInQT = linksInQT = hashtagsInQT = mentionsInQT = [];
		// check if it has images
		if (raw.extended_entities && raw.extended_entities.media) {
			hasImage = typeof raw.extended_entities.media !== "undefined";
		}
		if (raw.retweeted_status && raw.retweeted_status.extended_entities && raw.retweeted_status.extended_entities.media) {
			hasImageInRT = typeof raw.retweeted_status.extended_entities.media !== "undefined";
		}
		if (raw.quoted_status && raw.quoted_status.extended_entities && raw.quoted_status.extended_entities.media) {
			hasImageInQT = typeof raw.quoted_status.extended_entities.media !== "undefined";
		}
		// check if it has links
		if (raw.entities.urls) {
			hasLink = raw.entities.urls.length > 0;
		}
		if (raw.retweeted_status && raw.retweeted_status.entities.urls) {
			hasLinkInRT = raw.retweeted_status.entities.urls.length > 0;
		}
		if (raw.quoted_status && raw.quoted_status.entities.urls) {
			hasLinkInQT = raw.quoted_status.entities.urls.length > 0;
		}
		// check if it has hashtags
		if (raw.entities.hashtags) {
			hasHashtag = raw.entities.hashtags.length > 0;
		}
		if (raw.retweeted_status && raw.retweeted_status.entities.hashtags) {
			hasHashtagInRT = raw.retweeted_status.entities.hashtags.length > 0;
		}
		if (raw.quoted_status && raw.quoted_status.entities.hashtags) {
			hasHashtagInQT = raw.quoted_status.entities.hashtags.length > 0;
		}
		// check if it has mentions
		if (raw.entities.user_mentions) {
			hasMention = raw.entities.user_mentions.length > 0;
		}
		if (raw.retweeted_status && raw.retweeted_status.entities.user_mentions) {
			hasMentionInRT = raw.retweeted_status.entities.user_mentions.length > 0;
		}
		if (raw.quoted_status && raw.quoted_status.entities.user_mentions) {
			hasMentionInQT = raw.quoted_status.entities.user_mentions.length > 0;
		}

		if (hasImageInQT) {
			imagesInQT = raw.quoted_status.extended_entities.media.map(v => ({
				indices: v.indices,
				url: v.media_url_https,
				display_url: v.display_url
			}));
		}
		if (hasImageInRT) {
			imagesInRT = raw.retweeted_status.extended_entities.media.map(v => ({
				indices: v.indices,
				url: v.media_url_https,
				display_url: v.display_url
			}));
		} else if (hasImage) {
			images = raw.extended_entities.media.map(v => ({
				indices: v.indices,
				url: v.media_url_https,
				display_url: v.display_url
			}));
		}
		if (hasLinkInQT) {
			linksInQT = raw.quoted_status.extended_entities.urls.map(v => ({
				indices: v.indices,
				url: v.expanded_url,
				display_url: v.display_url
			}));
		}
		if (hasLinkInRT) {
			linksInRT = raw.retweeted_status.extended_entities.urls.map(v => ({
				indices: v.indices,
				url: v.expanded_url,
				display_url: v.display_url
			}));
		} else if (hasLink) {
			links = raw.extended_entities.urls.map(v => ({
				indices: v.indices,
				url: v.expanded_url,
				display_url: v.display_url
			}));
		}
		if (hasHashtagInQT) {
			hashtagsInQT = raw.quoted_status.extended_entities.hashtag.map(v => ({
				indices: v.indices,
				text: v.text
			}));
		}
		if (hasHashtagInRT) {
			hashtagsInRT = raw.retweeted_status.extended_entities.hashtag.map(v => ({
				indices: v.indices,
				text: v.text
			}));
		} else if (hasHashtag) {
			hashtags = raw.extended_entities.hashtag.map(v => ({
				indices: v.indices,
				text: v.text
			}));
		}
		if (hasMentionInQT) {
			mentionsInQT = raw.quoted_status.extended_entities.urls.map(v => ({
				indices: v.indices,
				id_str: v.id_str,
				screen_name: v.screen_name
			}));
		}
		if (hasMentionInRT) {
			mentionsInRT = raw.retweeted_status.extended_entities.media.map(v => ({
				indices: v.indices,
				id_str: v.id_str,
				screen_name: v.screen_name
			}));
		} else if (hasMention) {
			mentions = raw.extended_entities.hashtag.map(v => ({
				indices: v.indices,
				id_str: v.id_str,
				screen_name: v.screen_name
			}));
		}
		// apply the image/link/hashtag/mention
		if (isQuote) {
			for (let i in imagesInQT) {
				const ci = imagesInQT[ci];
				text = replaceStr(text, ci.indices[0], ci.indices[1], dobj("span", "img", ci.display_url, [], "onclick", "function(){alert(1);}").outerHTML);
			}
		}
		if (isRetweet) {} else {}
		let doesPing = false;
		let repliedTo = ['', '']; // type(username?status?), address

		const dom = dobj("div", ["twitObj", id], "", [dobj("span", "rawTS", timestamp.format(), [], "style", "display:none;"), dobj("span", "timestamp", simplifyTimestamp(timestamp)), dobj("span", `username${ isReply ? " reply" : "" }${ doesPing ? " ping" : "" }`, username), dobj("pre", "text", text)]);
		if (isQuote && (raw.quoted_status || raw.retweeted_status && raw.retweeted_status.quoted_status)) {
			dom.appendChild(dobj("span", "quote", "", [dobj("span", "rawTS", timeQuote.format(), [], "style", "display:none;"), dobj("span", "timestamp", simplifyTimestamp(timeQuote)), dobj("span", "username", userQuote), dobj("pre", "text", textQuote)]));
		}
		if (isRetweet) {
			dom.appendChild(dobj("span", "retweet", "", [dobj("span", "rawTS", timeRTed.format(), [], "style", "display:none;"), dobj("span", "username", userRTed), dobj("span", "timestamp", simplifyTimestamp(timeRTed))]));
		}
		if (hasImageInQT) {
			dom.querySelector(".quote .text").innerHTML = dom.querySelector(".quote .text").innerHTML.replace();
		}
		if (hasImageInRT) {} else if (hasImage) {}

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
			document.body.firstElementChild.replaceChild(dom, document.getElementById("tabs"));
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

const replaceStr = (str, start, end, what) => str.substring(0, start) + what + str.substring(end);
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
};

/*

var storedTabs = [];
for(var ts in tl) {
	storedTabs.push(tl[ts].tweets.map(v => v.outerHTML))
}
state.tl = JSON.stringify(storedTabs)

state.tl = JSON.parse(d.tl).map(function(v){;
 */
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

const defaultStateFileName = './state/state.json';
let state;
let stateFileName = './state/state.json';
const charWidth = 8;
const charHeight = 15;
const stateCon = {
	storedTabs: {},
	restoreStoredTabs: dobj("div"),
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
		tlCon.tab.add("Mention", {});
		tlCon.tab.add("Home", {});
		loCon.init();
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
				console.error("Failed saving current state!\n\
				Try manually copy the result with `JSON.stringify(state)` and save it as `./state/state.json`.");
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
				stateCon.forceSave(`./state/state${ timestamp }.json`, d);
				console.log(`Saved the current state in 'state${ timestamp }.json'.`);
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
			delete tl[tabName];
			tlOrder.splice(tlOrder.indexOf(tabName), 1);
			if (!tlOrder[tlCurrent]) tlCurrent--;
			if (noUpdate) {} else loCon.updateTabs();
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

			params.count = 20;
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
					emitErrorMsg(err.code);
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
						}, 1000);
					}
					console.log(`An error occured while updating ${ tabName }.`);
					emitErrorMsg(e.code);
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

const emitErrorMsg = errCode => {
	switch (errCode) {
		case 215:
			console.log("Authentication tokens is not set right. Check `js/twit.js` and update the token data.");
			break;
	}
};
