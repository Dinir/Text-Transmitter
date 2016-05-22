const fs = require("fs");
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

const loadSettings = (loc="./settings.json") => {
	console.groupCollapsed(`Preparing settings...`);
	let loadedSettings;
	try {
		loadedSettings = fs.readFileSync(loc);
		console.log(`Done.`);
		const result = JSON.parse(loadedSettings);
		console.dir(result);
		console.groupEnd();
		return result;
	} catch(e) {
		const defaultSettings = {
			width: 80,
			height: 24,

			tl: new Map(),
			tlOrder: [],
			tlCurrent: 0
		};
		if(e.code==="ENOENT") {
			console.log(`Couldn't find \`${loc}\`. Creating new default one...`);
			fs.writeFile(
				'./settings.json',
				JSON.stringify(defaultSettings),
				function(err) {
					if(err) console.error(`There is a problem creating the default settings:\n${err.message}`);
					else console.log(`Created default settings in \`${loc}\`.`);
				}
			);
		} else {
			console.error(`There is a problem preparing settings:\n${e}`);
		}
		console.log(`The default one will be used for now.`);
		console.groupEnd();
		return defaultSettings;
	}
};
const saveSettings = (settings, loc="./settings.json") => {
	fs.writeFile(loc, JSON.stringify(settings));
};
