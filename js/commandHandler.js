let cmd = {
	resize: function(w,h) {
		window.resizeTo(w*8, h*15+25);
	},
	rs: function(w,h) { return this.resize(w>13?w:13,h>6?h:6) },

	add: function(name,uri,pos) {

	}
};
function execute(command) {
	let prefix = command.slice(0,1);
	let argv = command.trim().substr(1).split(" ");
	cmd[argv.shift()](...argv);
}
