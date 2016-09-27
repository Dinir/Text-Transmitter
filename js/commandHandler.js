let cmd = {
	resize: function(w,h) {
		window.resizeTo((w>13?w:13)*8, (h>6?h:6)*15/*+25*/);
	},
	rs: function(w,h) { return this.resize(w,h) },

	compose: function(txt) {
		t.post('statuses/update', {status:txt}, function(e,d,r){
			if(e) {
				console.error("Failed composing tweet.");
				console.log(e);
			}
			console.log("Composing succeed.");
			composing = !composing;
		})
	},
	
	add: function(names,par,pos) {
		tlCon.tab.add(names,par,pos);
	},
	update: function(tabName, direction) {
		let tn, dr;
		if(tabName) {} else {tn = tlOrder[tlCurrent]};
		if(direction) {} else {dr = 1};
		tlCon.update(tn, dr);
	},
	u: function(tabName,direction) { return this.update(tabName,direction) },
};
const cmdDict = {
	show: cmd => {
		if(cmdDict[cmd].p) {
			return `<div><div class="contextCmdDict">${cmdDict[cmd].p}</div>${cmdDict[cmd].d}</div>`
		} else {
			return `<div>${cmdDict[cmd].d}</div>`
		}
	}
	,
	resize: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	rs: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	compose: {
		"p": "",
		"d": "-- COMPOSE --"
	},
	add: {
		"p": "add [nameOfTab,(URI)](, parameters, position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name', 'URI'], or skip URI and just choose one from below:<br>" +
		     `${getURIListInString()}<BR>` +
	       "If you know what is parameters, you can add them as a form of an object.<BR>" +
	       "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	update: {
		"p": "update tabName direction",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'."
	},
	u: {
		"p": "update tabName direction",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'."
	},
};
function execute(command) {
	let prefix = command.slice(0,1);
	let argv = command.trim().substr(1).split(" ");
	let cmdName = argv.shift();
	if(cmdName == "compose" ||
	   cmdName == "reply" ||
	   cmdName == "quote") {
		cmd[cmdName](argv.join(" "));
	} else {
		cmd[cmdName](...argv);
	}
}
