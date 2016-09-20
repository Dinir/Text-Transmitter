let moment = require('moment');

const storeTimestamp = rawTs => moment(rawTs, "ddd MMM D H:mm:ss Z YYYY");
const simplifyTimestamp = ts => ts
	   .fromNow(true)
     .replace(/a few/,"<1")
     .replace(/^an?/, "1")
	   .replace(/\s/, "")
     .replace(/seconds|minutes?/,"m")
     .replace(/hours?/,"h")
     .replace(/days?/,"d")
     .replace(/months?/,"M")
     .replace(/years?/,"y");

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
	twitObj: function(raw) {
		// store default permanent data
		const id = raw.id_str;
		let timestamp = storeTimestamp(raw.created_at);
		let username = raw.user.screen_name;
		let text = raw.text;
		let images;
		
		// less original data
		let isReply =
			raw.entities.user_mentions.length > 0 ||
			raw.in_reply_to_status_id_str !== null;
		let isRetweet = typeof raw.retweeted_status !== "undefined";
		let isQuote = raw.is_quote_status;
		let hasImage
			= hasImageInRT
			= hasImageInQT
			= hasLink
			= false;
		if(raw.extended_entities &&
		   raw.extended_entities.media) {
			let hasImage = typeof raw.extended_entities.media !== "undefined";
		}
		if(raw.retweeted_status &&
		   raw.retweeted_status.extended_entities &&
		   raw.retweeted_status.extended_entities.media) {
			let hasImageInRT = typeof raw.retweeted_status.extended_entities.media !== "undefined";
		}
		if(raw.quoted_status &&
		   raw.quoted_status.extended_entities &&
		   raw.quoted_status.extended_entities.media) {
			let hasImageInQT = typeof raw.quoted_status.extended_entities.media !== "undefined";
		}
		if(raw.entities.urls) {
			let hasLink = raw.entities.urls.length > 0;
		}
		
		// data I should produce
		let doesPing = false;
		let repliedTo = ['', '']; // type(username?status?), address

		// make additional data related to the default data if needed
		let userRTed, timeRTed, timeQuote, userQuote, textQuote;
		if(raw.entities.user_mentions.length > 0) {
		}
		if(raw.in_reply_to_status_id_str !== null) {
		}
		if(isRetweet) {
			userRTed = username;
			timeRTed = timestamp;
			timestamp = storeTimestamp(raw.retweeted_status.created_at);
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if(isQuote) {
			if(raw.quoted_status) {
				timeQuote = storeTimestamp(raw.quoted_status.created_at);
				userQuote = raw.quoted_status.user.screen_name;
				textQuote = raw.quoted_status.text;
			} else if(raw.retweeted_status &&
			         raw.retweeted_status.quoted_status) {
				timeQuote = storeTimestamp(raw.retweeted_status.quoted_status.created_at);
				userQuote = raw.retweeted_status.quoted_status.user.screen_name;
				textQuote = raw.retweeted_status.quoted_status.text;
				// it'll do the multiple quote tweet display.
			/*} else if(raw.entities.urls.length !== 0) {
				const urls = raw.entities.urls;
				const isItStatusUrl = /https:\/\/twitter.com\/.*\/status\/\d*//*;
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
		if(hasImageInQT) {
			
		}
		if(hasImageInRT) {
			
		} else if(hasImage) {
			images = raw.extended_entities.media.map(v => ({
				indices: v.indices,
				url: v.media_url_https,
				display_url: v.display_url
			}));
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
		if(hasLink) {
			
		}
		
		const dom = dobj("div",["twitObj",id],"",[
			
			dobj("span","rawTS",timestamp.format(),[],"style","display:none;"),
			
			dobj("span","timestamp",simplifyTimestamp(timestamp)),
			dobj("span",
				`username${isReply?" reply":""}${doesPing?" ping":""}`,username),
			dobj("pre","text",text)
		]);
		if(isQuote
		   && ( raw.quoted_status
		   || raw.retweeted_status && raw.retweeted_status.quoted_status
		   )) { dom.appendChild(
			dobj("span","quote","",[
				dobj("span","rawTS",timeQuote.format(),[],"style","display:none;"),
				dobj("span","timestamp",simplifyTimestamp(timeQuote)),
				dobj("span","username",userQuote),
				dobj("pre","text",textQuote)
			])
		)}
		if(isRetweet) { dom.appendChild(
			dobj("span","retweet","",[
				dobj("span","rawTS",timeRTed.format(),[],"style","display:none;"),
				dobj("span","username",userRTed),
				dobj("span","timestamp",simplifyTimestamp(timeRTed))
			])
		)}
		if(hasImageInQT) {
			
		}
		if(hasImageInRT) {
			
		} else if(hasImage) {
			
		}
		
		return dom;
	},
	tabObj: function(tlOrder) {
		let dom = dobj("section",["hl","tabs"],"&nbsp;");
		let notis = tlOrder.map(v => tl[v].notifications);
		dom.tabDoms = [];
		dom.make = function() {
			for(let i=0;i<tlOrder.length;i++) {
				if(notis[i]) {
					let nt = dobj(
						"span",
						[i===tlCurrent?"chosen":"", `tab${i}`],
						"",
						[dobj("span", [], notis[i])]
					);
					nt.innerHTML += `[${tlOrder[i]}]`;
					dom.tabDoms.push(nt);
				} else {
					dom.tabDoms.push(dobj(
							"span",
							[i===tlCurrent?"chosen":"", `tab${i}`],
							`[${tlOrder[i]}]`
					));
				}
			}
			dom.tabDoms.push(
				dobj("span",[,"close"],"X")
			);
			dom.appendChildren(...dom.tabDoms);
			document.body.firstElementChild.replaceChild(dom,document.getElementById("tabs"));
		};
		dom.updateNotification = function() {
			
		};
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
	if(tweetDom.getElementsByClassName("retweet").length) tweetDom.querySelector(".retweet .timestamp").innerHTML = simplifyTimestamp(moment(tweetDom.querySelector(".retweet .rawTS").innerHTML));
	if(tweetDom.getElementsByClassName("quote").length) tweetDom.querySelector(".quote .timestamp").innerHTML = simplifyTimestamp(moment(tweetDom.querySelector(".quote .rawTS").innerHTML));
};
/*
test script:

var twitDoms = []; var twts = []; t.get('statuses/user_timeline', {}, function(e,d,r){ twts=d; for(var i=0;i<twts.length;i++) twitDoms[i] = new display.twitObj(twts[i]); console.log('done'); });
*/