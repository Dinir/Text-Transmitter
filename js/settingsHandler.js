const fs = require('fs');

let settings = {};
const charWidth = 8;
const charHeight = 15;
const settingsCon = {
	make: () => {
		tlCon.tab.flush("Y");
		tlCon.tab.add("Mention",{});
		tlCon.tab.add("Home",{});
		tlCurrent = 1;
		const defaultSetting = JSON.stringify({
			"width":80,
			"height":24,
			"tl":Array.from(tl),
			"tlOrder":tlOrder,
			"tlCurrent":tlCurrent
		});
		fs.writeFile("./settings.json",defaultSetting,e => {
			if(e) {
				console.error("Failed saving the default one.\n\
						Any new changes made in this session won't be saved.");
				return e;
			}
			console.log("Saved the default setting.");
		});
	},
	load: fileName => {
		let target;
		if(fileName) target=fileName;
		else target="./settings.json";
		
		fs.readFile(target,(e,d) => {
			if(e) {
				console.error("Failed to load the settings.\n\
			\ Setting new default one.");
				settingsCon.make();
				return e;
			}
			try {
				settings = JSON.parse(d);
				settings.tl = new Map(settings.tl);
			}
			catch(e) {
				console.error("Failed parsing the settings.\n\
			Does it succeed if you manually try parsing it with `JSON.parse()`?");
			}
		})
	},
	save: fileName => {
		let target;
		if(fileName) target=fileName;
		else target="./settings.json";
		
		// TODO: I might want to change from Map to just Object if I come to the point that this map converting isn't working anymore.
		// `tl` is a Map, and I use `Array.from()` to convert it to a format that `JSON.stringify` can be applied.
		// It's only valid when the keys and values are serialisable. See: http://stackoverflow.com/questions/28918232/how-do-i-persist-a-es6-map-in-localstorage-or-elsewhere/35078054#35078054 .
		settings = {
			width: Math.round(window.innerWidth/charWidth),
			height: Math.round(window.innerHeight/charHeight),
			tl: Array.from(tl),
			tlOrder: tlOrder,
			tlCurrent: tlCurrent
		};
		
		fs.writeFile(target,JSON.stringify(settings),e => {
			if(e) {
				console.error("Failed saving current settings!\n\
				Try manually copy the result with `JSON.stringify(settings)`");
				return e;
			}
			console.log("Saved the settings.");
		})
	}
};