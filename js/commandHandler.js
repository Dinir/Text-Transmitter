const charWidth = 8;
const charHeight = 15;

const EndpointDefault = {
	"Mentions": {
		uri: "statuses/mentions_timeline",
		param: {}
	},
	"My Tweets": {
		uri: "statuses/user_timeline",
		param: {user_id: appUserId}
	},
	"Home": {
		uri: "statuses/home_timeline",
		param: {}
	},
	"Retweeted": {
		uri:"statuses/retweets_of_me",
		param: {}
	},
	"DM": {
		uri: ["direct_messages/sent","direct_messages"],
		param: {}
	}
};

const streamURI = [
	'statuses/filter',
	'statuses/sample',
	'statuses/firehose',
	'user',
	'site','1'
];

const cmd = {
	resize: function(w=state.width,h=state.height) {
		window.resizeTo((w>12?w:12)*charWidth, (h>7?h:7)*charHeight);
		state.width = w;
		state.height = h;
	},
	rs: function(w,h) { return this.resize(w,h) },

	add: function(name,uri=EndpointDefault[name].uri,pos) {
		const param = EndpointDefault[name].param==="undefined"?{}:EndpointDefault[name].param;
		tlCon.tab.add(name,uri,param,pos);
	}
};
function execute(command) {
	let prefix = command.slice(0,1);
	let argv = command.trim().substr(1).split(" ");
	switch(prefix) {
		case ":": cmd[argv.shift()](...argv); break;
		case "/": break;
	}
}
