let React = require('react');
let ReactDOM = require('react-dom');

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
	console.group(`Preparing settings...`);
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
			height: 24
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
	fs.writeFile(loc, settings);
};

const Dmain = React.createClass({
	getInitialState: () => ({
		settings: loadSettings(),
		tlOrder: [],
		tlCurrent: 0,
		receivingCommand: false,
		currentLine: 0,
		apiCallLeft: 0
	}),

	changeTabFocus: function(tlOrderNumber) {
		this.setState({tlCurrent: tlOrderNumber});

	},
	closeTab: function(currentTabToRemove) {
		tlCon.tab.remove(tlOrder[currentTabToRemove]);
		this.setState({
			tlOrder: tlOrder,
			tlCurrent: tlCurrent
		});
	},

	componentWillMount: function() {
		document.addEventListener("keydown", this.receiveKey);
		document.addEventListener("keyup", this.tidyKey);
		document.body.addEventListener("mousewheel", this.handleScroll, false);
	},
	componentWillUnmount: function() {
		saveSettings();
		document.removeEventListener("keydown", this.receiveKey);
		document.removeEventListener("keyup", this.tidyKey);
		document.body.removeEventListener("mousewheel", this.handleScroll, false);
	},

	render: function() {
		return (
			<div>
				<Dtabs changeTabFocus={this.changeTabFocus} closeTab={this.closeTab} tlOrder={this.state.tlOrder} tlCurrent={this.state.tlCurrent} />
				<Dtweets tabName={this.state.tlOrder[this.state.tlCurrent]}/>
				<Dcontrols />
				<DimgView />
			</div>
		)
	},

	cmd: {
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
	},
	executeCommand: function(command) {
		let prefix = command.slice(0,1);
		let argv = command.trim().substr(1).split(" ");
		switch(prefix) {
			case ":": this.cmd[argv.shift()](...argv); break;
			case "/": break;
		}
	},

	receiveKey: ctl.receiveKey,
	tidyKey: ctl.tidyKey,
	handleScroll: ctl.handleScroll,

});
