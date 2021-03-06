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
		add: function(nameAndAddress, parameters, position) {
			let tabName, address;
			if(nameAndAddress.constructor === Array) {
				tabName = nameAndAddress[0];
				nameAndAddress[1]? address = nameAndAddress[1]:"";
			} else {
				tabName = nameAndAddress;
				if(URI[nameAndAddress]) address = URI[nameAndAddress];
				else {
					console.error("Need to specify the URI.");
					return;
				}
			}
			if(!tl.hasOwnProperty(tabName)
			&& typeof tabName !== "undefined"
			&& tlOrder.indexOf(tabName) === -1) {
				let newTabFrame = {
					type:address,
					params:parameters?parameters:{},
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
			tlCon.update(tabName,1);
		},
		remove: function(tabName, noUpdate) {
			//let tabToDelete;
			//if(tabName) tabToDelete = tabName;
			//else tabToDelete = tlOrder[tlCurrent];
			//console.log(tabName);
			//console.log(tabToDelete);
			if(tlOrder.indexOf(tabName)!==-1) {
				if(tlOrder[tlCurrent] === tabName
				   && !tlOrder[tlCurrent+1]) {
					tlCurrent--;
				}
				tlOrder.splice(tlOrder.indexOf(tabName), 1);
				if(noUpdate) {} else {
					loCon.updateTabs();
					if(tlOrder.length!==0) loCon.updateMain();
				}
			}
			if(tl[tabName]) {
				delete tl[tabName];
			}
		},
		flush: function(really) {
			if(really === "y" || really === "Y")
				for(var i in tl)
					tlCon.tab.remove(i, 1);
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
		reorder: function(fromIndex, toIndex, swap) {
			const beforePos = tlOrder[tlCurrent];
			if(typeof fromIndex !== "undefined" &&
			   typeof toIndex !== "undefined") {
				let fr, to;
				if(parseInt(fromIndex)>=0) {
					// if fromIndex is number
					if(fromIndex<0)
						fr = 0;
					else if(fromIndex>=tlOrder.length)
						fr = tlOrder.length-1;
					else
						fr = fromIndex;
				} else {
					// if fromIndex is string
					fr = tlOrder.indexOf(fromIndex);
				}
				if(parseInt(toIndex)>=0) {
					// if toIndex is number
					if(toIndex<0)
						to = 0;
					else if(toIndex>=tlOrder.length)
						to = tlOrder.length-1;
					else
						to = toIndex;
				} else {
					// if toIndex is string
					to = tlOrder.indexOf(toIndex);
				}
				if(fr!==to && fr!==-1 && to !==-1) {
					if(typeof swap!=="undefined") {
						const tt = tlOrder[fr];
						tlOrder[fr] = tlOrder[to];
						tlOrder[to] = tt;
					} else {
						moveInArray(tlOrder,fr,to);
					}
				}
			}
			const currentViewChanged = tlCurrent !== tlOrder.indexOf(beforePos);
			if(currentViewChanged) {
				tlCurrent = tlOrder.indexOf(beforePos);
			}
			loCon.updateTabs();
			if(!currentViewChanged) {
				loCon.updateMain();
			}
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
			let tweets = contents.tweets;
			let params = contents.params;
			
			//params.count = 20;
			// TODO make it check if the type can use `since_id` and `max_id` first.
			switch(direction) {
				case -1:
					if(tweets[tweets.length-1]) {
						params.max_id = tweets[tweets.length-1].id;
					}
					if(params.hasOwnProperty("since_id")) {
						delete params.since_id;
					}
					break;
				case 1:
				default:
					if(tweets[0]) {
						params.since_id = tweets[0].id;
					}
					if(params.hasOwnProperty("max_id")) {
						delete params.max_id;
					}
					break;
			}
			
			t.get(contents.type, params, function(err,data,response){
				// TODO learn what errors and response are for.
				if(err) {
					if(tabName === tlOrder[tlCurrent]) {
						layout.main.appendChild(
							dobj("div", "error", err, [])
						);
					}
					console.log(`An error occured while updating ${tabName}.`);
					// it returns true when it can't find the code in itself.
					if(emitErrorMsgFromCode(err.code)) {
						if(err.message) alert(err.message);
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
					switch(contents.type) {
						case "search/tweets":
							data
								= data.statuses.map(c => new display.twitObj(c));
							break;
						default:
							data
							= data.map(c => new display.twitObj(c));
							break;
					}
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
					if(tlOrder[tlCurrent]===tabName)
						loCon.updateMain();
					tlCon.recentCall = false;
				} catch(e) {
					if(tabName === tlOrder[tlCurrent]) {
						// DAMN (2)
						let damn = setTimeout(function(){
							loCon.updateTabs("change", tlCurrent);
							clearTimeout(this);
						}, 2000);
					}
					console.log(`An error occured while updating ${tabName}.`);
					console.log(e.stack);
				}
			}); // t.get
		} // if-else tlCon.recentCall
	}, // update
	forceUpdate: function(tabName, direction) {
		if(tlCon.recentCall) {tlCon.recentCall = false}
		tlCon.update(tabName, direction);
	}
};

const emitErrorMsgFromCode = (errCode) => {
	switch(errCode) {
		case 215:
			console.log("Authentication tokens is not set right. Check `js/_twit.js` and update the token data.");
			break;
		default:
			return true;
			break;
	}
}