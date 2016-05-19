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
/*
let tl = new Map();
let tlOrder = [];
let tlCurrent = 0;
const apiCallMax = 15;
*/

let tlCon = {
	tab: {
		// that address should not be encouraged to be filled manually by users. it's the one listed in https://dev.twitter.com/rest/public.
		// that parameters also should not be encouraged to be filled manually by users. We will make a dictionary to refer for each of addresses and get needed ones to fill from.
		add: function(tabName, address, parameters, position) {
			if(!tl.has(tabName)
			&& typeof tabName !== "undefined"
			&& tlOrder.indexOf(tabName) === -1) {
				let v = {
					type:address, 
					params:parameters, 
					tweets:[],
					notifications:0
				};
				// if(streamURI.indexOf(tabName)>=0)
				// 	v.notifications=0;
				tl.set(tabName, v);
				if(typeof position==="undefined")
					tlOrder.push(tabName);
				else
					tlOrder.splice(position, 0, tabName);
				tlCurrent = tlOrder.indexOf(tabName);
			}
		},
		remove: function(tabName) {
			if(tlCurrent>0 &&
			tlCurrent===tlOrder.length-1)
				tlCurrent--;
			tl.delete(tabName);
			tlOrder.splice(tlOrder.indexOf(tabName),1);
		},
		flush: function(really) {
			if(really === "y" || really === "Y")
				tl.forEach(function(v, k) {tl.delete(k);})
		},
		rename: function(tabName, alterName) {
			if(typeof tabName !== "undefined"
			&& typeof alterName !== "undefined"
			&& tl.has(tabName)
			&& !tl.has(alterName)
			&& tlOrder.indexOf(tabName) > -1
			&& tlOrder.indexOf(alterName) === -1) {
				let contents = tl.get(tabName);
				tl.set(alterName, contents);
				tlOrder.splice(tlOrder.indexOf(tabName), 1, alterName);
				tl.delete(tabName);
			}
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
		}
	},
	recentCall: false,
	update: function(tabName, direction, actions) {
		if(tlCon.recentCall) {} else {
			tlCon.recentCall = true;
			let contents = tl.get(tabName);
			let tweets = contents.tweets;
			let params = contents.params;
			let notifications = contents.notifications;

			// TODO make it check if the type can use `since_id` and `max_id` first.
			switch(direction) {
				case 1:
					if(tweets[0]) {
						contents.params.since_id = tweets[0].id_str;
						contents.params.max_id = undefined;
					}
					break;
				case -1:
					if(tweets[tweets.length-1]) {
						contents.params.max_id = tweets[tweets.length-1].id_str;
						contents.params.since_id = undefined;
					}
					break;
			}

			t.get(contents.type, params, function(err,data,response){
				/*TODO check if received data should attach to or replace the previous data.
				for some of the api address the `direction` is meaningless
				and the data received should replace old data instead of attaching to it.
				but we're only testing for home, mention, user timeline at the moment
				so the default behavior will be adding the data to the old one.*/
				// TODO learn what errors and response are for.
				switch(direction) {
					case 1:
						contents.tweets = data.concat(tweets);
						break;
					case -1:
						contents.tweets.pop();
						contents.tweets = tweets.concat(data);
						break;
					case 0: // for those which doesn't need previous datas?
						contents.tweets = data;
						break;
				}
				tl.set(tabName, contents);
				tlCon.recentCall = false;
				actions();
				console.log("done");
			}); // t.get
		} // if-else tlCon.recentCall
	} // update
};
