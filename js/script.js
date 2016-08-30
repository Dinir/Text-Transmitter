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
const charHeight = 15;

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

const scrollHandler = () => {
	const e = window.event;
	document.body.scrollTop += (e.wheelDelta > 0 ? -1 : 1) * 3 * charHeight;
	return false;
};
let moment = require('moment');

// use moment to store timestamp
// var test = moment(tss[15].created_at, "ddd MMM D H:mm:ss Z YYYY")
/*
const hlsearch = (container, what, spanClass) => {
	let content = container.innerHTML,
		pattern = new RegExp('(>[^<.]*)(' + what + ')([^<.]*)','g'),
		replaceWith = '$1<span ' + ( spanClass ? 'class="' + spanClass + '"' : '' ) + '">$2</span>$3',
		highlighted = content.replace(pattern,replaceWith);
	return (container.innerHTML = highlighted) !== content;
}
*/

// quick dom creator
// accept tag, [classname, id], innerHTML.
/*const dh = {
	element: function(tag, names, inner) {
		let newOne = document.createElement(tag);
		if(names.constructor === Array) {
			names[0]? newOne.className = names[0]:"";
			names[1]? newOne.id = names[1]:"";
		} else
			newOne.className = names;
		inner? newOne.innerHTML = inner:"";
		// custom methods and properties goes below here
		newOne.appendChildren = function(children) {
			for(let i in arguments)
				newOne.appendChild(arguments[i]);
		};
		return newOne;
	}
};*/

const dobj = function (tag, names, inner, children) {
	let newOne = document.createElement(tag);

	if (names.constructor === Array) {
		names[0] ? newOne.className = names[0] : "";
		names[1] ? newOne.id = names[1] : "";
	} else newOne.className = names;

	inner ? newOne.innerHTML = inner : "";

	// custom methods and properties goes below here
	newOne.appendChildren = function (c) {
		for (let i in arguments) newOne.appendChild(arguments[i]);
	};
	if (children) {
		if (children.constructor === Array) newOne.appendChildren(...children);else newOne.appendChild(children);
	}

	return newOne;
};

/*var h = domObj("div","name","Root",[
	domObj("span","desc"," : Description for root"),
	domObj("ul","sub","Name of a sublist",[
		domObj("li","name","List item 1",
			domObj("span","desc"," : Description for List item 1")
		),
		domObj("li","name","List item 2",
			domObj("span","desc"," : Description for List item 2")
		)
	])
]);*/

const display = {
	twitObj: function (raw) {
		// store default permanent data
		const id = raw.id_str;
		let timestamp = raw.created_at;
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
		if (raw.entities.user_mentions.length > 0) {}
		if (raw.in_reply_to_status_id_str !== null) {}
		if (isRetweet) {
			let userRTed = username;
			let timeRTed = timestamp;
			timestamp = "00:01"; //raw.retweeted_status.created_at;
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if (isQuote) {
			let timeQuote = "00:02"; //raw.quoted_status.created_at;
			let userQuote = raw.quoted_status.user.screen_name;
			let textQuote = raw.quoted_status.text;
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

		const dom = dobj("div", ["twitObj", id], "", [dobj("span", "timestamp", timestamp), dobj("span", `username${ isReply ? " reply" : "" }${ doesPing ? " ping" : "" }`, username), dobj("pre", "text", text)]);
		if (isRetweet) {
			dom.appendChild(dobj("span", "retweet", "", [dobj("span", "username", userRTed), dobj("span", "timestamp", timeRTed)]));
		}
		if (isQuote) {
			dom.appendChild(dobj("span", "quote", "", [dobj("span", "timestamp", timeQuote), dobj("span", "username", userQuote), dobj("pre", "text", textQuote)]));
		}

		return dom;
	},
	tabObj: function (tlOrder) {
		this.update = function () {

			this.updateNotification();
		};
		this.updateNotification = function () {};
		this.update();

		let dom = dh.element("section", ["hl", "tabs"]);
		return dom;
	}
};
window.onload = () => {
	document.addEventListener("keydown", keyPress);
	document.addEventListener("keyup", checkStates);
	document.body.addEventListener("mousewheel", scrollHandler, false);
};
var Twit = require('twit');
var t = new Twit({
	consumer_key: 'xnUHcbRQGzwW1X0eeq2tonOvO',
	consumer_secret: '	gHhGwNK4pjdNVq9qRgZM5yFSLLr92AnrzsTPJZVxR0I74HAwKJ',
	access_token: 'a',
	access_token_secret: 'a',
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

const streamURI = ['statuses/filter', 'statuses/sample', 'statuses/firehose', 'user', 'site', '1'];

let tlCon = {
	tab: {
		// that address should not be encouraged to be filled manually by users. it's the one listed in https://dev.twitter.com/rest/public.
		// that parameters also should not be encouraged to be filled manually by users. We will make a dictionary to refer for each of addresses and get needed ones to fill from.
		add: function (tabName, address, parameters, position) {
			if (!tl.has(tabName) && typeof tabName !== "undefined" && tlOrder.indexOf(tabName) === -1) {
				let v = {
					type: address,
					params: parameters,
					tweets: []
				};
				if (streamURI.indexOf(tabName) >= 0) v.notifications = 0;
				tl.set(tabName, v);
				if (typeof position === "undefined") tlOrder.push(tabName);else tlOrder.splice(position, 0, tabName);
			}
		},
		remove: function (tabName) {
			tl.delete(tabName);
			tlOrder.splice(tlOrder.indexOf(tabName), 1);
		},
		flush: function (really) {
			if (really === "y" || really === "Y") tl.forEach(function (v, k) {
				tl.delete(k);
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
		if (tlCon.recentCall) {} else {
			tlCon.recentCall = true;
			let contents = tl.get(tabName);
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
				/*TODO check if received data should attach to or replace the previous data.
    for some of the api address the `direction` is meaningless
    and the data received should replace old datas instead of attaching to it.
    but we're only testing for home, mention, user timeline at the moment
    so the default behavior will be adding the data to the old one.*/
				// TODO learn what errors and response are for.
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
				tl.set(tabName, contents);
				tlCon.recentCall = false;
			}); // t.get
		} // if-else tlCon.recentCall
	} // update
};

/*
window.onload = () => {

	tlCon.tab.add("Home", 'statuses/home_timeline');
	tlCon.tab.add("My Tweets", 'statuses/user_timeline', {screen_name: 'NardinRinet'}); console.log(tlOrder);
	ReactDOM.render(
		<div>
			<display.tabs tlOrderArray={tlOrder} />
			<section id="main">
				{testTweets.map(
					(v,i) => {
						return (
							<display.twitObj key={i} raw={v} />
						)
					}
				)}
			</section>
			
		</div>
		, document.body.getElementsByTagName("article")[0]
	)
};
*/
