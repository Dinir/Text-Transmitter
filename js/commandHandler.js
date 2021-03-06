let cmd = {
	startnew: function() {
		stateCon.make();
	},
	resize: function(w,h) {
		window.resizeTo((w>13?w:13)*8, (h>6?h:6)*15/*+25*/);
	},
	save: function(fileName) {
		stateCon.save(fileName?fileName:"");
	},
	load: function(fileName) {
		stateCon.load(fileName?fileName:"");
	},
	rs: function(w,h) { return this.resize(w,h) },
	w: function(f) { return this.save(f) },
	o: function(f) { return this.load(f) },

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
				console.dir(e);
				return;
			}
			console.log("Composing succeed.");
			cmd.update();
			loCon.updateSelector(-1);
		});
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
			loCon.updateSelector(-1);
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
			if(currentTweetId === d.id_str) {
				layout.main.removeChild(layout.main.children[layout.selectorPos]);
				tl[tlOrder[tlCurrent]].tweets.splice(layout.selectorPos,1);
			}
		});
	},
	
	add: function(names,par,pos) {
		switch(names) {
			case "l":
			case "L":
				changeCmdQueryTo("addlist");
				break;
			case "user":
			case "User":
				changeCmdQueryTo("adduser");
				break;
			case "search":
			case "Search":
				changeCmdQueryTo("addsearch");
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
		tlCon.tab.add("l",p);
		tlCon.tab.rename("l",`${lslug}`);
		let damn = setTimeout(function() {
			tlCon.tab.remove("l");
			clearTimeout(this);
		}, 2000)
	},
	adduser: function(sname) {
		let p = {
			screen_name: sname
		};
		tlCon.tab.add("user",p);
		tlCon.tab.rename("user",`@${sname}`);
		let damn = setTimeout(function() {
			tlCon.tab.remove("user");
			clearTimeout(this);
		}, 2000)
	},
	addsearch: function(q) {
		let p = {
			q: q,
			result_type: "mixed"
		};
		tlCon.tab.add("search",p);
		tlCon.tab.rename("search",`${q}`);
		let damn = setTimeout(function() {
			tlCon.tab.remove("search");
			clearTimeout(this);
		}, 2000)
	},
	a: function(n,p,po) { return this.add(n,p,po) },
	al: function(s,l) { return this.addlist(s,l) },
	au: function(s) { return this.adduser(s) },
	as: function(q) { return this.addsearch(q) },
	
	remove: function(tabName) {
		tlCon.tab.remove(tabName);
	},
	rename: function(tabName, alterName) {
		tlCon.tab.rename(tabName, alterName);
	},
	reorder: function(from,to,swap) {
		tlCon.tab.reorder(from,to,swap);
	},
	rm: function(tabName) { return this.remove(tabName) },
	rn: function(tn,an) { return this.rename(tn,an) },
	ro: function(fr,to,sw) { return this.reorder(fr,to,sw) },
	
	update: function(tabName, direction) {
		let tn, dr;
		if(tabName) {} else {tn = tlOrder[tlCurrent]}
		if(direction) {} else {dr = 1}
		if(tl[tn].tweets) {
			tlCon.update(tn, dr);
		}
	},
	u: function(tabName,direction) { return this.update(tabName,direction) },
	about: function() {}
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
	startnew: {
		"d": "RESET EVERYTHING AND START AS A NEW INSTANCE."
	},
	resize: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	rs: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	save: {
		"p": "save( fileName)",
		"d": "Save current app state."
	},
	w: {
		"p": "save( fileName)",
		"d": "Save current app state."
	},
	load: {
		"p": "load( fileName)",
		"d": "Load the last saved(or specified) app state."
	},
	o: {
		"p": "load( fileName)",
		"d": "Load the last saved(or specified) app state."
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
		"d": "Retweet a tweet with the id. Omit id to retweet currently selected tweet."
	},
	del: {
		"p": "del( id)",
		"d": "Delete a tweet with the id. Omit id to delete currently selected tweet."
	},
	add: {
		"p": "add [nameOfTab(,URI)]( parameters position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name','URI'], or skip URI and just choose one from below:<BR>" +
		     `${getURIListInString()}<BR>` +
	       "If you know what parameters are, you can add them as a form of an object.<BR>" +
	       "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	a: {
		"p": "add [nameOfTab(,URI)]( parameters position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name','URI'], or skip URI and just choose one from below:<br>" +
		     `${getURIListInString()}<BR>` +
	       "If you know what parameters are, you can add them as a form of an object.<BR>" +
	       "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	},
	addlist: {
		"p": "addlist screenName list-slug",
		// avblist:<br>_ <== index 182
		// <== indexOf("lists:<br>")+10
		"d": "Add a list with the list-slug, made by screenName. <br>" +
		     "screenName is the twitter username, <br>" +
		     "list-slug is the list name in lower-cases-alphabet-and-hyphens.<br>" +
	       "Your lists:<br>" +
	       "[]"
	},
	al: {
		"p": "addlist screenName list-slug",
		"d": "Add a list with the list-slug, made by screenName. <br>" +
		     "screenName is the twitter username, <br>" +
		     "list-slug is the list name in lower-cases-alphabet-and-hyphens.<br>" +
		     "Your lists:<br>" +
		     "[]"
	},
	adduser: {
		"p": "adduser screenName",
		"d": "Add a tab of specific user tweets. screenName is the twitter username of the user."
	},
	au: {
		"p": "adduser screenName",
		"d": "Add a tab of specific user tweets. screenName is the twitter username of the user."
	},
	addsearch: {
		"p": "addsearch query",
		"d": "Add a tab of specific search results."
	},
	as: {
		"p": "addsearch query",
		"d": "Add a tab of specific search results."
	},
	remove: {
		"p": "remove nameOfTab",
		"d": "Remove a tab with the name. To quickly close a tab, click 'X' at the end of the tab list, or in the top-right corner of the screen."
	},
	rm: {
		"p": "remove nameOfTab",
		"d": "Remove a tab with the name. To quickly close a tab, click 'X' at the end of the tab list, or in the top-right corner of the screen."
	},
	rename: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	rn: {
		"p": "rename nameOfTab nameToApply",
		"d": "Rename a tab from nameOfTab to nameToApply."
	},
	reorder: {
		"p": "reorder oldIndex newIndex swap",
		"d": "Move a tab in oldIndex to newIndex. If swap is true(anything considered as true in javascript is okay), only move two tabs, one in oldIndex and the other in newIndex."
	},
	ro: {
		"p": "reorder oldIndex newIndex swap",
		"d": "Move a tab in oldIndex to newIndex. If swap is true(anything considered as true in javascript is okay), only move two tabs, one in oldIndex and the other in newIndex."
	},
	update: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets."
	},
	u: {
		"p": "update( tabName direction)",
		"d": "Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets"
	},
	about: {
		"d": "&copy; 2016 Dinir Nertan<br>" +
	       `${newLinkAnchor(["dinir.works","http://dinir.works"])}<br>` +
	       `${newLinkAnchor(["github.com/Dinir/Text-Transmitter","https://github.com/Dinir/Text-Transmitter"])}`
	}
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