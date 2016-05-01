/* things for storing data that should not be requested every time a request occurs goes here */

/* test commands
var twts = [];
t.get('statuses/user_timeline', {screen_name: "NardinRinet"}, function(err,data,response) {
wts=data; });
var twtt = twts.map(function(t) {return new twitObject(t); });
 */

/* remove duplicate in arrays
abc2 = (function(arr) {
return arr.reduce( function(prv,cur) {
if(prv.indexOf(cur)<0) prv.push(cur);
return prv;
}, [] );
})(abc);
 */
"use strict";
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var cmd = {
	resize: function resize(w, h) {
		window.resizeTo(w * 8, h * 15 + 25);
	},
	rs: function rs(w, h) {
		return this.resize(w, h);
	},

	add: function add(name, uri, pos) {}
};
function execute(command) {
	var prefix = command.slice(0, 1);
	var argv = command.trim().substr(1).split(" ");
	cmd[argv.shift()].apply(cmd, _toConsumableArray(argv));
}
"use strict";

//import {execute} from "./commandHandler.js";

// Shift Ctrl Alt 16 17 18
// or, use e.shiftKey/ctrlKey/altKey
// PgUp PgDn End Home 33 34 35 36
// a-z 65-90
// ; 186
// Backspace 8

document.onkeydown = keyPress;
document.onkeyup = keyPress;

var receivingCommand = false;

function keyPress(e) {
	console.log(e.type + " " + e.keyCode + " " + e.code + " " + e.charCode);
	//e.preventDefault();
	var query = document.getElementById("query");

	/* Note: keyCode is deprecated.
  * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
  * But no alternative is currently available in electron.js!
  */

	// write ':' or '/' to go command receiving mode, press 'esc' while on it to cancel.
	if (!receivingCommand ? e.shiftKey && e.keyCode === 186 || e.keyCode === 191 : e.keyCode === 27) ctl.toggleCommand();

	// TODO make this width change happens when keydown event occurs.
	// change the input size according to the length of text wrote
	if (receivingCommand) {
		var charWidth = 7.8;
		// change the size when typing,
		// and hide when the last character has deleted with backspace.
		if (query.value.length > 0) {
			query.style.width = (query.value.length + 1) * charWidth + "px";
		} else {
			if (e.keyCode === 8 || e.keyCode === 46) ctl.toggleCommand();
		}
	}

	// press 'Enter' to execute the command.
	if (receivingCommand && e.keyCode === 13) {
		execute(query.value);
		ctl.toggleCommand();
	}
}

// it toggles what the bottom line shows every time it's invoked.
var ctl = {
	toggleCommand: function toggleCommand() {
		var query = document.getElementById("query");
		var status = document.getElementById("status");
		var commandInput = document.getElementById("commandInput");
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
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = require('react');
var ReactDOM = require('react-dom');
//let moment = require('moment');

// use moment to store timestamp
// var test = moment(tss[15].created_at, "ddd MMM D H:mm:ss Z YYYY")

var twitObj = React.createClass({
	displayName: 'twitObj',

	propTypes: {
		raw: React.PropTypes.object.isRequired
	},
	render: function render() {
		var raw = this.props.raw;
		var timestamp = raw.created_at;
		var username = raw.user.screen_name;
		var text = raw.text;
		var manipulationIndices = [text];

		var isReply = raw.entities.user_mentions.length > 0 || raw.in_reply_to_status_id_str !== null;
		var isRetweet = typeof raw.retweeted_status !== "undefined";
		var isQuote = raw.is_quote_status;
		var hasImage = typeof raw.entities.media !== "undefined";
		var hasLink = raw.entities.urls.length > 0;

		// reply info
		// raw.entities.user_mentions
		// {id_str, indices[], screen_name}[]
		// raw.in_reply_to_status_id_str
		// id (in string)
		if (raw.entities.user_mentions.length > 0) {}
		if (raw.in_reply_to_status_id_str !== null) {}
		if (isRetweet) {
			var _userRTed = username;
			var _timeRTed = timestamp;
			timestamp = raw.retweeted_status.created_at;
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if (isQuote) {
			var _timeQuote = raw.quoted_status.created_at;
			var _userQuote = raw.quoted_status.user.screen_name;
			var _textQuote = raw.quoted_status.text;
		}
		if (hasImage) {
			// let images = raw.extended_entities.media.map(function(v) {
			// 	manipulationIndices.push([...v.indices,]);
			// 	return {
			// 		indices:v.indices,
			// 		url:v.media_url_https
			// 	}
			// });
			raw.extended_entities.media.forEach(function (v) {
				return manipulationIndices.push([].concat(_toConsumableArray(v.indices)));
			});
		}
		// TODO I can make it so multiple quotes can be shown as quoted statuses.
		if (hasLink) {}

		return React.createElement(
			'div',
			null,
			React.createElement(
				'span',
				{ className: 'timestamp' },
				timestamp
			),
			React.createElement(
				'span',
				{ className: 'username' + (isReply ? " reply" : "") + (doesPing ? " ping" : "") },
				username
			),
			React.createElement(
				'span',
				{ className: 'text' },
				text
			),
			isRetweet ? React.createElement(
				'span',
				{ className: 'retweet' },
				React.createElement(
					'span',
					{ className: 'username' },
					userRTed
				),
				React.createElement(
					'span',
					{ className: 'timestamp' },
					timeRTed
				)
			) : null,
			isQuote ? React.createElement(
				'span',
				{ className: 'quote' },
				React.createElement(
					'span',
					{ className: 'timestamp' },
					timeQuote
				),
				React.createElement(
					'span',
					{ className: 'username' },
					userQuote
				),
				React.createElement(
					'span',
					{ className: 'text' },
					textQuote
				)
			) : null
		);
	}
});

function twitObject(rawObj) {
	this.timestamp = rawObj.created_at;
	this.username = rawObj.user.screen_name;
	this.text = rawObj.text;

	// TODO make them have more information about their related tweets.
	this.isReply;
	this.isRetweet;
	this.isQuote;
	this.hasImage;
	this.hasLink;

	if (this.isReply = rawObj.entities.user_mentions.length > 0 || rawObj.in_reply_to_status_id_str !== null) {}

	if (this.isRetweet = typeof rawObj.retweeted_status !== "undefined") {
		this.timeRTed = this.timestamp;
		this.userRTed = this.username;
		this.timestamp = rawObj.retweeted_status.created_at;
		this.username = rawObj.retweeted_status.user.screen_name;
		this.text = rawObj.retweeted_status.text;
	}

	if (this.isQuote = rawObj.is_quote_status) {
		this.timeQuote = rawObj.quoted_status.created_at;
		this.userQuote = rawObj.quoted_status.user.screen_name;
		this.textQuote = rawObj.quoted_status.text;
	}
	if (this.hasImage = typeof rawObj.entities.media !== "undefined") {
		// TODO parse the image link on the text, change it to display_url, make it clickable, put a placeholder of function that loads and shows you the image when clicked
	}
	if (this.hasLink = rawObj.entities.urls.length > 0) {
		// TODO also do similar thing to the image functions here!
	}
}

var timelineTweets = {};
var tweetMold = "";

window.onload = function () {
	var data = [{ timestamp: '23:15', username: 'x_nuk', reply: true, pinged: true, text: "@DinirNertan OH YEAH I'M SO AWESOME" }, { timestamp: '14:58', username: '_30_Java_', text: '30億のデバイスで走るJava', retweet: { username: 'DinirNertan', timestamp: '16:13' } }];
	var Quote = function Quote(_ref) {
		var timestamp = _ref.timestamp;
		var username = _ref.username;
		var text = _ref.text;
		return React.createElement(
			'span',
			{ className: 'quote' },
			React.createElement(
				'span',
				{ className: 'timestamp' },
				timestamp
			),
			React.createElement(
				'span',
				{ className: 'username' },
				username
			),
			React.createElement(
				'span',
				{ className: 'text' },
				text
			)
		);
	};
	var Retweet = function Retweet(_ref2) {
		var username = _ref2.username;
		var timestamp = _ref2.timestamp;
		return React.createElement(
			'span',
			{ className: 'retweet' },
			React.createElement(
				'span',
				{ className: 'username' },
				username
			),
			React.createElement(
				'span',
				{ className: 'timestamp' },
				timestamp
			)
		);
	};
	var Tweet = function Tweet(_ref3) {
		var timestamp = _ref3.timestamp;
		var username = _ref3.username;
		var reply = _ref3.reply;
		var pinged = _ref3.pinged;
		var text = _ref3.text;
		var quote = _ref3.quote;
		var retweet = _ref3.retweet;
		return React.createElement(
			'div',
			null,
			React.createElement(
				'span',
				{ className: 'timestamp' },
				timestamp
			),
			React.createElement(
				'span',
				{ className: ["username", reply ? "reply" : "", pinged ? "pinged" : ""].join(' ').trim() },
				username
			),
			React.createElement(
				'span',
				{ className: 'text' },
				text
			),
			quote ? Quote(quote) : null,
			retweet ? Retweet(retweet) : null
		);
	};
	var Timeline = function Timeline() {
		return React.createElement(
			'div',
			{ id: 'timeline' },
			data.map(Tweet)
		);
	};
	ReactDOM.render(React.createElement(
		'div',
		null,
		React.createElement(
			'h1',
			null,
			'Hello, world!!'
		),
		React.createElement(Timeline, null)
	), document.getElementById('main'));
};
'use strict';

var t = new (0, require('twit'))({
	consumer_key: 'adyOv8nxxNwe4q7MdoAsLTgV8',
	consumer_secret: 'GUZIeiN6HNWN23JlCiR9HwrUhvAbMNEJasj7UWlwp5NKiDQY00',
	access_token: '712975464332075008-SSkhEdwP1fPPlh1sxy3LCggliOTIzjs',
	access_token_secret: 'TUZkw1GxHBpCHdJq7X1SsPCnOEqCyfUceAC2ss5iR1pWP'
});

var appUserId = "712975464332075008";
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
var tl = new Map();
// valid argument on the need of this array though,
// that because you can just directly move the order of elements (in this case, tabs) and save the order at the end of the process and reload it at the startup.
var tlOrder = [];

var tlCon = {
	tab: {
		// that address should not be encouraged to be filled manually by users. it's the one listed in https://dev.twitter.com/rest/public.
		// that parameters also should not be encouraged to be filled manually by users. We will make a dictionary to refer for each of addresses and get needed ones to fill from.
		add: function add(tabName, address, parameters, position) {
			if (!tl.has(tabName) && typeof tabName !== "undefined" && tlOrder.indexOf(tabName) === -1) {
				tl.set(tabName, {
					type: address,
					params: parameters,
					tweets: []
				});
				if (typeof position === "undefined") tlOrder.push(tabName);else tlOrder.splice(position, 0, tabName);
			}
		},
		remove: function remove(tabName) {
			tl.delete(tabName);
			tlOrder.splice(tlOrder.indexOf(tabName), 1);
		},
		flush: function flush(really) {
			if (really === "y" || really === "Y") tl.forEach(function (v, k) {
				tl.delete(k);
			});
		},
		rename: function rename(tabName, alterName) {
			if (typeof tabName !== "undefined" && typeof alterName !== "undefined" && tl.has(tabName) && !tl.has(alterName) && tlOrder.indexOf(tabName) > -1 && tlOrder.indexOf(alterName) === -1) {
				var contents = tl.get(tabName);
				tl.set(alterName, contents);
				tlOrder.splice(tlOrder.indexOf(tabName), 1, alterName);
				tl.delete(tabName);
			}
		},
		reorder: function reorder(tabName, place, swap) {
			if (typeof tabName !== "undefined") {
				if (typeof swap !== "undefined") {
					tlOrder.splice.apply(tlOrder, [place, 0].concat(_toConsumableArray(tlOrder.splice(tlOrder.indexOf(tabName), 1))));
				} else {
					var placeSwap = tlOrder.indexOf(tabName);
					tlCon.tab.reorder(tabName, place);
					tlCon.tab.reorder(tlOrder[place - 1], placeSwap);
				}
			}
		}
	},
	recentCall: false,
	update: function update(tabName, direction) {
		if (tlCon.recentCall) {} else {
			(function () {
				tlCon.recentCall = true;
				var contents = tl.get(tabName);
				var tweets = contents.tweets;
				var params = contents.params;

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
			})();
		} // if-else tlCon.recentCall
	} // update
};
