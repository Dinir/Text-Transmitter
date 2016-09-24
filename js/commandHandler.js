let cmd = {
	resize: function(w,h) {
		window.resizeTo(w*8, h*15/*+25*/);
	},
	rs: function(w,h) { return this.resize(w>13?w:13,h>6?h:6) },

	add: function(names,par,pos) {
		tlCon.tab.add(names,par,pos);
	}
};
const cmdDict = {
	show: cmd =>
		`<div><div class="contextCmdDict">${cmdDict[cmd].p}</div>${cmdDict[cmd].d}</div>`
	,
	resize: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	rs: {
		"p": "resize width height",
		"d": "Resize the window."
	},
	add: {
		"p": "add [nameOfTab,(URI)](, parameters, position)",
		"d": "Add new tab. You can specify the URI (the format should be an array: ['name', 'URI'], or skip URI and just choose one from below:<br>" +
		     `${getURIListInString()}<BR>` +
	       "If you know what is parameters, you can add them as a form of an object.<BR>" +
	       "You can set which position the new tab should go. If you don't want to specify parameters, make it an empty object and specify the position: `{}, 3`"
	}
};
function execute(command) {
	let prefix = command.slice(0,1);
	let argv = command.trim().substr(1).split(" ");
	cmd[argv.shift()](...argv);
}
