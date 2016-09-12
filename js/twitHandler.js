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
	"Mention":'statuses/mentions_timeline',
	"User":'statuses/user_timeline',
	"Home":'statuses/home_timeline',
	"RTed":'statuses/retweets_of_me',
	"DM Sent":'direct_messages/sent',
	"Search":'search/tweets',
	"DM":'direct_messages',
	"L":'lists/statuses'
};
const streamURI = {
	"Filter":'statuses/filter',
	"Sample":'statuses/sample',
	"User":'user'
};

let tlCon = {
	tab: {
		// that address should not be encouraged to be filled manually by users. it's the one listed in https://dev.twitter.com/rest/public.
		// that parameters also should not be encouraged to be filled manually by users. We will make a dictionary to refer for each of addresses and get needed ones to fill from.
		add: function(nameAndAddress, parameters, position) {
			let tabName, address;
			if(nameAndAddress.constructor === Array) {
				tabName = nameAndAddress[0];
				nameAndAddress[1]? address = nameAndAddress[1]:"";
			} else {
				tabName = nameAndAddress;
				if(URI[nameAndAddress]) address = URI[nameAndAddress];
				else console.error("Need to specify the URI.");
			}
			if(!tl.hasOwnProperty(tabName)
			&& typeof tabName !== "undefined"
			&& tlOrder.indexOf(tabName) === -1) {
				let newTabFrame = {
					type:address,
					params:parameters,
					tweets:[]
				};
				if(streamURI.hasOwnProperty(tabName))
					newTabFrame.notifications=0;
				tl[tabName] = newTabFrame;
				if(typeof position==="undefined")
					tlOrder.push(tabName);
				else
					tlOrder.splice(position, 0, tabName);
			}
			loCon.updateTabs();
		},
		remove: function(tabName, noUpdate) {
			delete tl[tabName];
			tlOrder.splice(tlOrder.indexOf(tabName),1);
			if(!tlOrder[tlCurrent]) tlCurrent--;
			if(noUpdate) {} else loCon.updateTabs();
		},
		flush: function(really) {
			if(really === "y" || really === "Y")
				for(var i in tl)
					tlCon.tab.remove(tl[i], 1);
		},
		rename: function(tabName, alterName) {
			if(typeof tabName !== "undefined"
			&& typeof alterName !== "undefined"
			&& tl.hasOwnProperty(tabName)
			&& !tl.hasOwnProperty(alterName)
			&& tlOrder.indexOf(tabName) > -1
			&& tlOrder.indexOf(alterName) === -1) {
				let contents = tl[tabName];
				tl[alterName] = contents;
				tlOrder.splice(tlOrder.indexOf(tabName), 1, alterName);
				delete tl[tabName];
			}
			loCon.updateTabs();
		},
		reorder: function(tabName, place, swap) {
			if(typeof tabName !== "undefined") {
				if(typeof swap !== "undefined") {
					tlOrder.splice(place, 0, ...tlOrder.splice(tlOrder.indexOf(tabName), 1));
				} else {
					let placeSwap = tlOrder.indexOf(tabName);
					tlCon.tab.reorder(tabName, place);
					tlCon.tab.reorder(tlOrder[place-1], placeSwap);
				}
			}
			loCon.updateTabs();
		}
	},
	recentCall: false,
	update: function(tabName, direction) {
		if(tlCon.recentCall) {} else if(direction) {
			let contents;
			if(tabName) contents = tl[tabName];
			else if(tl.hasOwnProperty("Home")) contents = tl["Home"];
			else {
				console.error("Specify the tab to update.");
				return;
			}
			
			tlCon.recentCall = true;
			let tweets = tl[tabName].tweets;
			let params = tl[tabName].params;

			// TODO make it check if the type can use `since_id` and `max_id` first.
			// TODO Fix it. This part doesn't catch current end of loaded tweets!
			switch(direction) {
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
					if(tweets[tweets.length-1])
						params.max_id = tweets[tweets.length-1].id_str;
					break;
				case 1:
				default:
					if(tweets[0])
						params.since_id = tweets[0].id_str;
					break;
			}

			t.get(contents.type, params, function(err,data,response){
				// TODO learn what errors and response are for.
				/*TODO check if received data should attach to or replace the previous data.
				for some of the api address the `direction` is meaningless
				and the data received should replace old datas instead of attaching to it.
				but we're only testing for home, mention, user timeline at the moment
				so the default behavior will be adding the data to the old one.*/
				data = data.map(c => new display.twitObj(c));
				switch(direction) {
					case 1:
						tweets = data.concat(tweets);
						break;
					case -1:
						tweets.pop();
						tweets = tweets.concat(data);
						break;
					case 0: // for those which doesn't need previous datas?
						tweets = data;
						break;
				}
				contents.tweets = tweets;
				contents.params = params;
				tl[tabName] = contents;
				if(tlOrder[tlCurrent] === tabName)
					loCon.updateMain();
				tlCon.recentCall = false;
			}); // t.get
		} // if-else tlCon.recentCall
	}, // update
	forceUpdate: function(tabName, direction) {
		if(tlCon.recentCall) {tlCon.recentCall = false}
		tlCon.update(tabName, direction);
	}
};
