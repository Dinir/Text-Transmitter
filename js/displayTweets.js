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
const dh = {
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
};

const display = {
	twitObj: function(raw) {
		// store default permanent data
		const id = raw.id_str;
		let timestamp = raw.created_at;
		let username = raw.user.screen_name;
		let text = raw.text;
		
		// less original data
		let isReply =
			raw.entities.user_mentions.length > 0 ||
			raw.in_reply_to_status_id_str !== null;
		let isRetweet = typeof raw.retweeted_status !== "undefined";
		let isQuote = raw.is_quote_status;
		let hasImage = typeof raw.entities.media !== "undefined";
		let hasLink = raw.entities.urls.length > 0;
		
		// data I should produce
		let doesPing = false;
		let repliedTo = ['', '']; // type(username?status?), address

		// make additional data related to the default data if needed		
		if(raw.entities.user_mentions.length > 0) {
		}
		if(raw.in_reply_to_status_id_str !== null) {
		}
		if(isRetweet) {
			let userRTed = username;
			let timeRTed = timestamp;
			timestamp = "00:01"; //raw.retweeted_status.created_at;
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if(isQuote) {
			let timeQuote = "00:02"; //raw.quoted_status.created_at;
			let userQuote = raw.quoted_status.user.screen_name;
			let textQuote = raw.quoted_status.text;
		}
		if(hasImage) {
			// let images = raw.extended_entities.media.map(function(v) {
			// 	manipulationIndices.push([...v.indices,]);
			// 	return {
			// 		indices:v.indices,
			// 		url:v.media_url_https
			// 	}
			// });
			raw.extended_entities.media.forEach(
				v => {
					manipulationIndices.push([
						...v.indices,
						(
							1
						)
					]);
				}
			);
		}
		if(hasLink) {
			
		}
		
		let dom = new dh.element(
			"div", ["twitObj", id]
		);
		let domTimestamp = new dh.element(
			"span", "timestamp", timestamp
		);
		let domUsername = new dh.element(
			"span", `username${isReply?" reply":""}${doesPing?" ping":""}`, username
		);
		let domText = new dh.element(
			"pre", "text", text
		);
		dom.appendChildren(domTimestamp, domUsername, domText);
		if(isRetweet) {
			let domRT = new dh.element(
				"span", "retweet"
			);
			let domRTuser = new dh.element(
				"span", "username", userRTed
			);
			let domRTtime = new dh.element(
				"span", "timestamp", timeRTed
			);
			domRT.appendChildren(domRTuser, domRTtime);
			dom.appendChild(domRT);
		}
		if(isQuote) {
			let domQT = new dh.element(
				"span", "retweet"
			);
			let domQTtime = new dh.element(
				"span", "timestamp", timeQuote
			);
			let domQTuser = new dh.element(
				"span", "username", userQuote
			);
			let domQTtext = new dh.element(
				"pre", "text", textQuote
			);
			domQT.appendChildren(domQTtime, domQTuser, domQTtext);
			dom.appendChild(domQT);
		}
		return dom;
	},
	tabObj: function(tlOrder) {
		this.update = function() {
			
			this.updateNotification();
		};
		this.updateNotification = function() {
			
		};
		this.update();
		
		let dom = dh.element("section",["hl","tabs"]);
		return dom;
	}
};
  