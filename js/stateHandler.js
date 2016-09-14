const fs = require('fs');

// clone objects
// http://stackoverflow.com/a/728694/4972931
function cloneObj(obj) {
	var copy;
	
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;
	
	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}
	
	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = cloneObj(obj[i]);
		}
		return copy;
	}
	
	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = cloneObj(obj[attr]);
		}
		return copy;
	}
	
	throw new Error("Unable to copy obj! Its type isn't supported.");
}

const defaultStateFileName = './state/state.json';
let state;
let stateFileName = './state/state.json';
const charWidth = 8;
const charHeight = 15;
const stateCon = {
	storedTabs: {},
	restoreStoredTabs: dobj("div"),
	storeTweets: () => {
		stateCon.storedTabs = cloneObj(tl);
		for(var ts in stateCon.storedTabs)
			stateCon.storedTabs[ts].tweets = tl[ts].tweets.map(v => v.outerHTML);
		//return JSON.stringify(stateCon.storedTabs);
		return stateCon.storedTabs;
	},
	restoreTweets: () => {
		stateCon.storedTabs = state.tl;
		for(let ts in stateCon.storedTabs) {
			stateCon.storedTabs[ts].tweets = stateCon.storedTabs[ts].tweets.map(v => {
				stateCon.restoreStoredTabs.innerHTML = v;
				return stateCon.restoreStoredTabs.firstChild;
			})
		}
		return stateCon.storedTabs;
	},
	
	make: () => {
		loCon.init();
		tlCon.tab.flush("Y");
		tlCon.tab.add("Mention",{});
		tlCon.tab.add("Home",{});
		tlCurrent = 1;
		const defaultState = JSON.stringify({
			"width":80,
			"height":24,
			"tl":stateCon.storeTweets(),
			"tlOrder":tlOrder,
			"tlCurrent":tlCurrent
		});
		state = defaultState;
		fs.writeFile(defaultStateFileName,JSON.stringify(state),'utf8',e => {
			if(e) {
				console.error("Failed creating the default one.\n" +
				              "Any new changes made in this session won't be saved.");
				console.log(e);
				return e;
			}
			stateFileName = defaultStateFileName;
			console.log("Created the default state.");
		});
		loCon.updateTabs();
	},
	load: fileName => {
		let target;
		if(fileName) target=fileName;
		else target=defaultStateFileName;
		
		fs.readFile(target,'utf8',(e,d) => {
			if(e) {
				console.error("Failed to load the state.\n" +
				              "Creating new default one.");
				stateCon.make();
				return e;
			}
			try {
				state = JSON.parse(d);
				tl = stateCon.restoreTweets();
				tlOrder = state.tlOrder;
				tlCurrent = state.tlCurrent;
				stateFileName = target;
				console.log("Loaded the state.");
				for(let i=0;i<tlOrder.length;i++) {
					tlCon.forceUpdate(tlOrder[i], 1);
				}
				loCon.init();
			}
			catch(e) {
				console.error("Failed parsing the state.\n" +
				              "Does it succeed if you manually try parsing it with `JSON.parse('${fileName}')`?");
				console.log(e);
			}
		})
	},
	forceSave: (fileName, contentOfState, silent) => {
		// assert `contentOfState` is already in a JSON form.
		let target;
		if(fileName) target = fileName;
		else target=defaultStateFileName;
		let stateToSave;
		
		if(contentOfState) {
			stateToSave = contentOfState;
		} else {
			// overwrite the variable `state` below with the current state, which is used for saving and loading states.
			state = {
				width: Math.round(window.innerWidth/charWidth),
				height: Math.round(window.innerHeight/charHeight),
				tl: stateCon.storeTweets(),
				tlOrder: tlOrder,
				tlCurrent: tlCurrent
			};
			stateToSave = JSON.stringify(state); console.log(stateToSave);
		}
		
		fs.writeFile(target,stateToSave,'utf8', e => {
			if(e) {
				console.error("Failed saving current state!\n\
				Try manually copy the result with `JSON.stringify(state)` and save it as `./state/state.json`.");
				return e;
			}
			stateFileName = target;
			if(!silent) console.log("Saved the state.");
		})
	},
	backup: () => {
		fs.readFile(stateFileName,'utf8',(e,d) => {
			// here I used two `e`. There must be a much clear and clever way to handle errors from multiple sources.
			if(e) {
				console.error("Failed loading the current state.\n" +
				              "Manually backup the current state file and execute `stateCon.forceSave()` to overwrite your current state.");
				console.log(e);
				return e;
			}
			try {
				const timestamp = moment().format("YYMMDDHHmmss");
				stateCon.forceSave(`./state/state${timestamp}.json`, d);
				console.log(`Saved the current state in 'state${timestamp}.json'.`);
			} catch(e) {
				console.error("Failed making a backup of the current state.");
				console.log(e);
				return e;
			}
		});
	},
	save: fileName => {
		// what it does is backup the old state with a new file name, and save current state with the designated file name so you can get back to old one.
		let target;
		if(fileName) target=fileName;
		else target=defaultStateFileName;
		// save the old one loaded at the startup.
		stateCon.backup();
		// save the current state with the designated file name.
		stateCon.forceSave(target, "", 1);
		stateFileName = target;
	}
};