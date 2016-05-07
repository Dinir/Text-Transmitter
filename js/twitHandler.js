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

const streamURI = [
	'statuses/filter',
	'statuses/sample',
	'statuses/firehose',
	'user',
	'site','1'
];

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
					tweets:[]
				};
				if(streamURI.indexOf(tabName)>=0)
					v.notifications=0;
				tl.set(tabName, v);
				if(typeof position==="undefined")
					tlOrder.push(tabName);
				else
					tlOrder.splice(position, 0, tabName);
			}
		},
		remove: function(tabName) {
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
	update: function(tabName, direction) {
		if(tlCon.recentCall) {} else {
			tlCon.recentCall = true;
			let contents = tl.get(tabName);
			let tweets = contents.tweets;
			let params = contents.params;

			// TODO make it check if the type can use `since_id` and `max_id` first.
			switch(direction) {
				case 1:
					if(tweets[0])
						params.since_id = tweets[0].id_str;
					break;
				case -1:
					if(tweets[tweets.length-1])
						params.max_id = tweets[tweets.length-1].id_str;
					break;
			}

			t.get(contents.type, params, function(err,data,response){
				/*TODO check if received data should attach to or replace the previous data.
				for some of the api address the `direction` is meaningless
				and the data received should replace old datas instead of attaching to it.
				but we're only testing for home, mention, user timeline at the moment
				so the default behavior will be adding the data to the old one.*/
				// TODO learn what errors and response are for.
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