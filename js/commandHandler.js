const charWidth = 8;
const charHeight = 15;

const EndpointURIs = {
	"Mentions":"statuses/mentions_timeline",
	"My Tweets":"statuses/user_timeline",
	"Home":"statuses/home_timeline",
	"Retweeted":"statuses/retweets_of_me",
	"DM":["direct_messages/sent","direct_messages"],
};

let cmd = {
	resize: function(w=state.width,h=state.height) {
		window.resizeTo((w>12?w:12)*charWidth, (h>7?h:7)*charHeight);
		state.width = w;
		state.height = h;
	},
	rs: function(w,h) { return this.resize(w,h) },

	add: function(name,uri,pos) {

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
