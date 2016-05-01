//import {execute} from "./commandHandler.js";

// Shift Ctrl Alt 16 17 18
// or, use e.shiftKey/ctrlKey/altKey
// PgUp PgDn End Home 33 34 35 36
// a-z 65-90
// ; 186
// Backspace 8

document.onkeydown = keyPress;
document.onkeyup = keyPress;

let receivingCommand = false;

function keyPress(e) {
	console.log(`${e.type} ${e.keyCode} ${e.code} ${e.charCode}`);
	//e.preventDefault();
	const query = document.getElementById("query");

	/* Note: keyCode is deprecated.
	 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
	 * But no alternative is currently available in electron.js!
	 */

	// write ':' or '/' to go command receiving mode, press 'esc' while on it to cancel.
	if(
		!receivingCommand
		? e.shiftKey && e.keyCode===186 || e.keyCode===191
		: e.keyCode===27
	)
		ctl.toggleCommand();

	// TODO make this width change happens when keydown event occurs.
	// change the input size according to the length of text wrote
	if(receivingCommand) {
		const charWidth = 7.8;
		// change the size when typing,
		// and hide when the last character has deleted with backspace.
		if(query.value.length > 0) {
			query.style.width = ((query.value.length+1) * charWidth) + "px";
		} else {
			if(e.keyCode===8 || e.keyCode===46) ctl.toggleCommand();
		}
	}

	// press 'Enter' to execute the command.
	if(receivingCommand && e.keyCode===13) {
		execute(query.value);
		ctl.toggleCommand();
	}
}

// it toggles what the bottom line shows every time it's invoked.
let ctl = {
	toggleCommand: function(){
		const query = document.getElementById("query");
		const status = document.getElementById("status");
		const commandInput = document.getElementById("commandInput");
		if(receivingCommand){
			// should I be able to define variables and use them instead of invoking all these querySelectors every time?
			query.value = "";
			status.style.display = "inherit";
			commandInput.style.display = "none";
		} else {
			status.style.display = "none";
			commandInput.style.display = "inherit";
			document.getElementById("query").focus();
		}
		receivingCommand = !receivingCommand;
	}
};

