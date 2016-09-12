const fs = require('fs');

let state = {};
let stateFileName;
const charWidth = 8;
const charHeight = 15;
const stateCon = {
	make: () => {
		tlCon.tab.flush("Y");
		tlCon.tab.add("Mention",{});
		tlCon.tab.add("Home",{});
		tlCurrent = 1;
		const defaultState = JSON.stringify({
			"width":80,
			"height":24,
			"tl":Array.from(tl),
			"tlOrder":tlOrder,
			"tlCurrent":tlCurrent
		});
		fs.writeFile("./state.json",defaultState,e => {
			if(e) {
				console.error("Failed creating the default one.\n" +
				              "Any new changes made in this session won't be saved.");
				return e;
			}
			stateFileName = "./state.json";
			console.log("Created the default state.");
		});
	},
	load: fileName => {
		let target;
		if(fileName) target=fileName;
		else target="./state.json";
		
		fs.readFile(target,(e,d) => {
			if(e) {
				console.error("Failed to load the state.\n" +
				              "Creating new default one.");
				stateCon.make();
				return e;
			}
			try {
				// It actually copies the references of the values obtained from JSON. It's great, but I'm not sure if it's okay to keep, as it's not intended at first.
				state = JSON.parse(d);
				state.tl = new Map(state.tl);
				tl = state.tl;
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
				              "Does it succeed if you manually try parsing it with `JSON.parse()`?");
			}
		})
	},
	forceSave: (fileName, contentOfState) => {
		// assert `contentOfState` is already in a JSON form.
		let target;
		if(fileName) target = fileName;
		else target="./state.json";
		let stateToSave;
		
		/* TODO: I might want to change from Map to just Object if I come to the point that this map converting isn't working anymore.
		`tl` is a Map, and I use `Array.from()` to convert it to a format that `JSON.stringify` can be applied.
		It's only valid when the keys and values are serialisable.
		See: http://stackoverflow.com/questions/28918232/how-do-i-persist-a-es6-map-in-localstorage-or-elsewhere/35078054#35078054 . */
		if(contentOfState) {
			stateToSave = contentOfState;
		} else {
			// overwrite the variable `state` below with the current state, which is used for saving and loading states.
			// TODO: while converting `tl` to a array, it lost every tweet it contains. Would there be a good way to convert an array of HTMLDivElement to a string, and get it back to original HTMLDivElement?
			state = {
				width: Math.round(window.innerWidth/charWidth),
				height: Math.round(window.innerHeight/charHeight),
				tl: Array.from(tl),
				tlOrder: tlOrder,
				tlCurrent: tlCurrent
			};
			stateToSave = JSON.stringify(state);
		}
		
		fs.writeFile(target,stateToSave, e => {
			if(e) {
				console.error("Failed saving current state!\n\
				Try manually copy the result with `JSON.stringify(state)`");
				return e;
			}
			stateFileName = target;
			console.log("Saved the state.");
		})
	},
	backup: () => {
		fs.readFile(stateFileName,(e,d) => {
			// here I used two `e`. There must be a much clear and clever way to handle errors from multiple sources.
			if(e) {
				console.error("Failed loading the current state.\n" +
				              "Manually backup the current state file and execute `stateCon.forceSave()` to overwrite your current state.");
				return e;
			}
			try {
				const timestamp = moment().format("YYMMDDHHmmss");
				stateCon.forceSave(`./state${timestamp}.json`, d);
				console.log(`Saved the current state in 'state${timestamp}.json'.`);
			} catch(e) {
				console.error("Failed making a backup of the current state.");
				return e;
			}
		});
	},
	save: fileName => {
		// what it does is backup the old state with a new file name, and save current state with the designated file name so you can get back to old one.
		let target;
		if(fileName) target=fileName;
		else target="./state.json";
		// save the old one loaded at the startup.
		stateCon.backup();
		// save the current state with the designated file name.
		stateCon.forceSave(target);
		stateFileName = target;
	}
};