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
		
		// less original data
		let isReply =
			(raw.in_reply_to_user_id_str ||
			raw.in_reply_to_status_id_str);
		let isRetweet = typeof raw.retweeted_status !== "undefined";
		let isQuote = raw.is_quote_status;
		
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
			}
		}
		
		// check image/link/hashtag/mention
		let hasImage = {T:false, RT:false, QT:false};
		let hasLink = {T:false, RT:false, QT:false};
		let hasHashtag = {T:false, RT:false, QT:false};
		let hasMention = {T:false, RT:false, QT:false};
		let images = {T:[], RT:[], QT:[]};
		let links = {T:[], RT:[], QT:[]};
		let hashtags = {T:[], RT:[], QT:[]};
		let mentions = {T:[], RT:[], QT:[]};
		// check if it has medias in its status
		if(raw.extended_entities && raw.extended_entities.media)
			hasImage["T"] = typeof raw.extended_entities.media !== "undefined";
		if(raw.entities) {
			if(raw.entities.urls)
				hasLink["T"] = raw.entities.urls.length > 0;
			if(raw.entities.hashtags)
				hasHashtag["T"] = raw.entities.hashtags.length > 0;
			if(raw.entities.user_mentions)
				hasMention["T"] = raw.entities.user_mentions.length > 0;
		}
		// check if it has medias in its rted status
		if(raw.retweeted_status) {
			if(raw.retweeted_status.extended_entities && raw.retweeted_status.extended_entities.media)
				hasImage["RT"] = typeof raw.retweeted_status.extended_entities.media!=="undefined";
			if(raw.retweeted_status.entities) {
				if(raw.retweeted_status.entities.urls)
					hasLink["RT"] = raw.retweeted_status.entities.urls.length>0;
				if(raw.retweeted_status.entities.hashtags)
					hasHashtag["RT"] = raw.retweeted_status.entities.hashtags.length>0;
				if(raw.retweeted_status.entities.user_mentions)
					hasHashtag["RT"] = raw.retweeted_status.entities.user_mentions.length>0;
			}
		}
		// check if it has medias in its qted status
		if(raw.quoted_status) {
			if(raw.quoted_status.extended_entities && raw.quoted_status.extended_entities.media)
				hasImage["QT"] = typeof raw.quoted_status.extended_entities.media!=="undefined";
			if(raw.quoted_status.entities) {
				if(raw.quoted_status.entities.urls)
					hasLink["QT"] = raw.quoted_status.entities.urls.length>0;
				if(raw.quoted_status.entities.hashtags)
					hasHashtag["QT"] = raw.quoted_status.entities.hashtags.length>0;
				if(raw.quoted_status.entities.user_mentions)
					hasMention["QT"] = raw.quoted_status.entities.user_mentions.length>0;
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
		if(hasImage["RT"]) {
			images["RT"] = exportImages(raw.retweeted_status.extended_entities.media);
		} else if(hasImage["T"]) {
			images["T"] = exportImages(raw.extended_entities.media);
		}
		if(hasImage["QT"]) {
			images["QT"] = exportImages(raw.quoted_status.extended_entities.media);
		}
		// export link data
		if(hasLink["RT"]) {
			links["RT"] = exportLinks(raw.retweeted_status.entities.urls);
		} else if(hasLink["T"]) {
			links["T"] = exportLinks(raw.entities.urls);
		}
		if(hasLink["QT"]) {
			links["QT"] = exportLinks(raw.quoted_status.entities.urls);
		}
		// export hashtag data
		if(hasHashtag["RT"]) {
			hashtags["RT"] = exportHashtags(raw.retweeted_status.entities.hashtags);
		} else if(hasHashtag["T"]) {
			hashtags["T"] = exportHashtags(raw.entities.hashtags);
		}
		if(hasHashtag["QT"]) {
			hashtags["QT"] = exportHashtags(raw.quoted_status.entities.hashtags);
		}
		// export mention data
		if(hasMention["RT"]) {
			mentions["RT"] = exportMentions(raw.retweeted_status.entities.user_mentions);
		} else if(hasMention["T"]) {
			mentions["T"] = exportMentions(raw.entities.user_mentions);
		}
		if(hasMention["QT"]) {
			mentions["QT"] = exportMentions(raw.quoted_status.entities.user_mentions);
		}
		// apply the image/link/hashtag/mention
		const tplist = ["RT", "T", "QT"];
		for(let tp in tplist) {
			let curtp = tplist[tp];
			// store first length of the tweet text
			// let l = text.length;
			// let lq;
			// if(textQuote) lq = textQuote.length;
			if(hasImage[curtp]) {
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
				for(let i in images[curtp]) {
					// const la = text.length - l;
					// let lqa;
					// if(textQuote) lqa = textQuote.length - lq;
					const ci = images[curtp][i];
					switch(curtp) {
						case "RT":
						case "T":
							let addedText = text.replace(ci.url, newImgAnchor([ci.display_url,ci.media_url]));
							text = addedText;
							break;
						case "QT":
							let addedTextQT = textQuote.replace(ci.url, newImgAnchor([ci.display_url,ci.media_url]));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for images
		for(let tp in tplist) {
			let curtp = tplist[tp];
			if(hasLink[curtp]) {
				for(let i in links[curtp]) {
					const ci = links[curtp][i];
					switch(curtp) {
						case "RT":
						case "T":
							let addedText = text.replace(ci.url, newLinkAnchor([ci.display_url,ci.expanded_url]));
							text = addedText;
							break;
						case "QT":
							let addedTextQT = textQuote.replace(ci.url, newLinkAnchor([ci.display_url,ci.expanded_url]));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for links
		for(let tp in tplist) {
			let curtp = tplist[tp];
			if(hasHashtag[curtp]) {
				for(let i in hashtags[curtp]) {
					const ci = hashtags[curtp][i];
					switch(curtp) {
						case "RT":
						case "T":
							//let addedText = text.replace(`#${ci.text}`, newLinkAnchor([`#${ci.text}`,`https://twitter.com/hashtag/${ci.text}?src=hash`]));
							let addedText = text.replace(`#${ci.text}`, clickableCmdCandidate('addsearch',`#${ci.text}`));
							text = addedText;
							break;
						case "QT":
							//let addedTextQT = textQuote.replace(`#${ci.text}`, newLinkAnchor([`#${ci.text}`,`https://twitter.com/hashtag/${ci.text}?src=hash`]));
							let addedTextQT = textQuote.replace(`#${ci.text}`, clickableCmdCandidate('addsearch',`#${ci.text}`));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for hashtags
		for(let tp in tplist) {
			let curtp = tplist[tp];
			if(hasMention[curtp]) {
				for(let i in mentions[curtp]) {
					const ci = mentions[curtp][i];
					switch(curtp) {
						case "RT":
						case "T":
							//let addedText = text.replace(`@${ci.screen_name}`, newLinkAnchor([`@${ci.screen_name}`,`https://twitter.com/${ci.screen_name}`]));
							let addedText = text.replace(`@${ci.screen_name}`, clickableCmdCandidate('adduser',`${ci.screen_name}`,`@${ci.screen_name}`));
							text = addedText;
							break;
						case "QT":
							//let addedTextQT = textQuote.replace(ci.url, newLinkAnchor([`@${ci.screen_name}`,`https://twitter.com/${ci.screen_name}`]));
							let addedTextQT = textQuote.replace(`@${ci.screen_name}`, clickableCmdCandidate('adduser',`${ci.screen_name}`,`@${ci.screen_name}`));
							textQuote = addedTextQT;
							break;
					} // switch rt t qt
				} // for i in tp
			} // if has[tp]
		} // for mentions
		let doesPing = text.match(`@${myName}`);
		
		if(text.match("<br>") &&
		   textQuote.match("<br>")) {} else {
			text = convertLineBreaks(text);
			if(textQuote) textQuote = convertLineBreaks(textQuote);
		}
		
		const dom = dobj("div",["twitObj",id],"",[
			dobj("span","rawTS",timestamp.format(),[],"style","display:none;"),
			clickableTimestamp(timestamp,username,id),
			//tsDom,
			//dobj("span","timestamp",simplifyTimestamp(timestamp)),
			clickableUserDom(username, isReply, doesPing),
			dobj("div","text",text)
		]);
		if(isQuote
		   && ( raw.quoted_status
		   || raw.retweeted_status && raw.retweeted_status.quoted_status
		   )) { dom.appendChild(
			dobj("span","quote","",[
				dobj("span","rawTS",timeQuote.format(),[],"style","display:none;"),
				clickableTimestamp(timeQuote,userQuote,id),
				//dobj("span","timestamp",simplifyTimestamp(timeQuote)),
				//dobj("span","username",userQuote),
				clickableUserDom(userQuote),
				dobj("div","text",textQuote)
			])
		)}
		if(isRetweet) { dom.appendChild(
			dobj("span","retweet","",[
				dobj("span","rawTS",timeRTed.format(),[],"style","display:none;"),
				// dobj("span","username",userRTed),
				clickableUserDom(userRTed),
				clickableTimestamp(timeRTed,userRTed,id)
				//dobj("span","timestamp",simplifyTimestamp(timeRTed))
			])
		)}
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
			if(document.body.firstElementChild) {
				document.body.firstElementChild.replaceChild(dom, document.getElementById("tabs"));
			} else {
				document.body.firstElementChild.appendChild(dom)
			}
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

// make it so clicking timestamp opens tweet page in host's web browser. the code below is the timestamp that can be clicked.
const clickableTimestamp = function(timestamp, uname, id){
	const tw = document.createElement("span");
	tw.innerHTML = newLinkAnchor([
		simplifyTimestamp(timestamp),
		`https://twitter.com/${uname}/status/${id}`
	]);
	tw.firstChild.className = "timestamp";
	return tw.firstChild;
};
// make it so clicking username opens a tab of tweets of that user.
const clickableUserDom = function(uname, isReply, doesPing){
	const uw = document.createElement("span");
	uw.innerHTML = doCommandFromLink(
		uname, `:adduser ${uname}`
	);
		uw.firstChild.className = `username${isReply?" reply":""}${doesPing?" ping":""}`;
	return uw.firstChild;
};

const clickableCmdCandidate = function(cmd, content, displayAs){
	const ew = document.createElement("span");
	ew.innerHTML = doCommandFromLink(
		displayAs?displayAs:content, `:${cmd} ${content}`
	);
	return ew.innerHTML;
};