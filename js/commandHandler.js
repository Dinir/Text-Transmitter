const charWidth = 8;
const charHeight = 15;

let cmd = {
	resize: function(w,h) {
		window.resizeTo((w>12?w:12)*charWidth, (h>7?h:7)*charHeight);
		state.width = w;
		state.height = h;
	},
	rs: function(w,h) { return this.resize(w,h) },

	add: function(name,uri,pos) {

	}
};
function execute(command) {
	let prefix = command.slice(0,1);
	let argv = command.trim().substr(1).split(" ");
	cmd[argv.shift()](...argv);
}
