const sh = require('shell');

// function that replaces string.
// http://codepen.io/Dinir/pen/amJEzY
// argument receive type:
// 1: string, start, end, stringToReplace
// 2: str, start1, end1, repl1, start2, end2, repl2, ...
// 3: str, [start1,end1,start2,end2,...], [repl1,repl2,...]
const replaceStr = function(str, start, end, repl){
	if(arguments.length === 4) {
		// if arguments is simple as defined above, do this. One single replacement.
		return (str.substring(0, start) + repl + str.substring(end));
	} else if(arguments.length % 3 - 1 === 0) {
		// if arguments are little complex, as 'str, start1, end1, repl1, start2, end2, repl2, ...', do this.
		let result = "";
		for(let i=0;i<arguments.length;i+=3) {
			result += i===0?str.slice(0,arguments[i+1]):(arguments[i] + str.slice(arguments[i-1],i===arguments.length-1?str.length:arguments[i+1]));
		}
		return result;
	}	else if(arguments.length === 3
	           && arguments[1].constructor === Array
	           && arguments[2].constructor === Array) {
		// first array [1] will contain indices, second array [2] will contain texts as replacement.
		const s = str, is = arguments[1], t = arguments[2];
		let result = "";
		for(let i=0;i<t.length;i++) {
			result += (i===0?s.slice(0,is[i]):"")+t[i] + s.slice(is[2*i+1],i===t.length-1?s.length:is[2*i+2]);
		}
		return result;
	}
};
const convertLineBreaks = str =>
	str.replace(/(?:\r\n|\r|\n)/g, "<br>");

// Move an array element from one position to another
// http://stackoverflow.com/a/5306832/4972931
const moveInArray = function (arr, old_index, new_index) {
	while (old_index < 0) {
		old_index += arr.length;
	}
	while (new_index < 0) {
		new_index += arr.length;
	}
	if (new_index >= arr.length) {
		var k = new_index - arr.length;
		while ((k--) + 1) {
			arr.push(undefined);
		}
	}
	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	return arr; // for testing purposes
};

const URI = {
	"mention":'statuses/mentions_timeline',
	"user":'statuses/user_timeline',
	"home":'statuses/home_timeline',
	"rted":'statuses/retweets_of_me',
	"dmsent":'direct_messages/sent',
	"search":'search/tweets',
	"dm":'direct_messages',
	"l":'lists/statuses',
};
const streamURI = {
	"filter":'statuses/filter',
	"sample":'statuses/sample',
	"user":'user'
};

const getURIListInString = () => {
	let urilist='';
	for(let i in URI){
		urilist+=(urilist.length===0?"":", ")+i
	}
	return urilist;
};

const getLists = () => {
	let l;
	t.get('lists/list',{},function(e,d,r){
		if(e) {
			console.error("An error occurred while fetching lists.");
			return e;
		}
		l = d;
		l.list = l.map(v=>
		v.slug+"<span>("+v.description+")</span>").join(", ");
		lists = l;
	});
};
