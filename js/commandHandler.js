let cmd = {
	resize: function(w,h) {
		window.resizeTo((w>13?w:13)*8, (h>6?h:6)*15/*+25*/);
	},
	rs: function(w,h) { return this.resize(w,h) },

	compose: function(txt, params) {
		let p;
		if(params){
			p = params;
		} else {
			p = {};
		}
		p.status = txt;
		//if(tToReply) p.in_reply_to_status_id = tToReply;
		t.post('statuses/update', p, function(e,d,r){
			if(e) {
				console.error("Failed composing tweet.");
				console.log(e);
				return;
			}
			console.log("Composing succeed.");
			composing = !composing;
			cmd.update();
		})
		tToReply = "";
	},
	reply: function(id,txt) {
		// tToReply and iToReply are set in commandReceiver, when the key is pressed.
		cmd.compose(txt, {in_reply_to_status_id: id});
		cmd.update();
	},
	retweet: function(id) {
		let idToRT=id?id:currentTweetId;
		t.post('statuses/retweet/:id', {id:idToRT},function(e,d,r){
			if(e) {
				console.error("Failed retweeting the tweet.");
				console.log(e);
				return;
			}
			console.log("The tweet has been retweeted.");
			console.log(d);
			cmd.update();
		});
	},
	del: function(id) {
		let idToDel=id?id:currentTweetId;
		t.post('statuses/destroy/:id',{id:idToDel,trim_user:true},function(e,d,r){
			if(e) {
				console.error("Failed deleting tweet.");
				console.log(e);
				return;
			}
			console.log("Tweet has been deleted.");
			console.log(d);
		});
	},
	
	add: function(names,par,pos) {
		switch(names) {
			case "L":
				changeCmdQueryTo("addlist");
				break;
			default:
				tlCon.tab.add(names,par,pos);
				break;
		}
	},
	addlist: function(sname,lslug) {
		let p = {
			owner_screen_name: sname,
			slug: lslug
		};
		tlCon.tab.add("L",p);
		tlCon.tab.rename("L",`${lslug}`);
		let damn = setTimeout(function() {
			tlCon.tab.remove("L");
			clearTimeout(this);
		}, 2000)
	},
	remove: function(tabName) {
		tlCon.tab.remove(tabName);
	},
	rm: function(tabName) { return this.remove(tabName) },
	rename: function(tabName, alterName) {
		tlCon.tab.rename(tabName, alterName);
	},
	rn: function(tn,an) { return this.rename(tn,an) },
	
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
	reply: {
		"p": "",
		"d": "-- REPLYING&nbsp;"
	},
	retweet: {
		"p": "retweet( id)",
		"d": "Retweet a tweet with the id. omit id to retweet currently selected tweet."
	},
	del: {
		"p": "del( id)",
		"d": "Delete a tweet with the id. Omit id to delete currently selected tweet."
	},
	add: {
		"p": "add [nameOfTab,(URI)]( parameters position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name','URI'], or skip URI and just choose one from below:<br>" +
		     `${getURIListInString()}<BR>` +
	       "If you know what parameters are, you can add them as a form of an object.<BR>" +
	       "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	addlist: {
		"p": "addlist screenName listSlug",
		"d": "Add a list with the listSlug, made by screenName. <br>" +
		     "screenName is the twitter username, <br>" +
		     "listSlug is a name consist of lower-cases-alphabet-and-hyphens.<br>"
	},
	remove: {
		"p": "remove( nameOfTab)",
		"d": "Remove a tab with the name. Omit nameOfTab to remove current tab."
	},
	rm: {
		"p": "remove( nameOfTab)",
		"d": "Remove a tab with the name. Omit nameOfTab to remove current tab."
	},
	rename: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	rn: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	update: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets."
	},
	u: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets"
	},
};
function execute(command) {
	let prefix = command.slice(0,1);
	let argv = command.trim().substr(1).split(" ");
	let cmdName = argv.shift();
	if(cmdName == "compose") {
		cmd[cmdName](argv.join(" "));
	} else if(cmdName == "reply") {
		let cmdTarget = argv.shift();
		cmd[cmdName](cmdTarget, argv.join(" "));
		
	} else {
		cmd[cmdName](...argv);
		console.log(cmdName);
		console.log(argv.join(" "));
	}
}
function changeCmdQueryTo(command) {
	ctl.toggleCommand();
	let q = document.getElementById("query");
	q.value = `:${command} `;
	let cp = command.match(/([\w\d]+)\s/);
	if(cp) {
		setCmdContext(cmdDict.show(cp[1]));
	} else {
		setCmdContext(cmdDict.show(command));
	}
}