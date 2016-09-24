const replaceStr = (str, start, end, repl) =>
	(str.substring(0, start)
	 + repl
	 + str.substring(end));
const convertLineBreaks = str =>
	str.replace(/(?:\r\n|\r|\n)/g, "<br>");

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

const getURIListInString = () => {
	let urilist='';
	for(let i in URI){
		urilist+=(urilist.length===0?"":", ")+i
	}
	return urilist;
};