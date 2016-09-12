//import {execute} from "./commandHandler.js";

// Shift Ctrl Alt 16 17 18
// or, use e.shiftKey/ctrlKey/altKey
// PgUp PgDn End Home 33 34 35 36
// a-z 65-90
// ; 186
// Backspace 8


let receivingCommand = false;
let lastKeyCode = 0;
let cmdContextText, cmdContextRightText;
const setCmdContext = (texts) => {
	if(texts) {
		if(texts.constructor===Array) {
			// if(varname) passes any non-empty string
			// if(varname !== undefined) passes any string
			if(texts[0]) cmdContextText = texts[0];
			if(texts[1] !== undefined) cmdContextRightText = texts[1];
		} else {
			cmdContextText = texts;
		}
	}
	loCon.cmdContextUpdate();
};

function keyPress(e) {
	lastKeyCode = e.keyCode;
	console.log(`${e.type} ${e.keyCode} ${e.code} ${e.charCode}`);
	//e.preventDefault();
	const query = document.getElementById("query");

	// scroll a page when presses 'PgUp/Dn'
	if(e.keyCode===33 || e.keyCode===34) {
		document.body.scrollTop += (e.keyCode===33?-1:1)*(window.innerHeight-2*charHeight);
	}

	if(!receivingCommand) { // when the buffer is closed
		// ':' or '/' to open buffer
		if(e.shiftKey && e.keyCode===186 || e.keyCode===191)
			ctl.toggleCommand();

	} else { // when the buffer is open

		// 'esc' or 'enter' to close buffer.
		if(e.keyCode===27 || e.keyCode===13) {
			if(e.keyCode===13) execute(query.value);
			ctl.toggleCommand();
		}
	}
}

function checkStates() {
	const query = document.getElementById("query");
	// 'backspace' or 'delete' to empty the buffer to close it
	if((lastKeyCode===8 || lastKeyCode===46)
	                      && query.value.length === 0)
		ctl.toggleCommand();
}

// it toggles what the bottom line shows every time it's invoked.
const ctl = {
	toggleCommand: () => {
		const query = document.getElementById("query");
		const status = document.getElementById("status");
		const commandInput = document.getElementById("commandInput");
		if(receivingCommand) {
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

// makes it so body scrolls 3 lines at a time.
const scrollHandler = () => {
	const e = window.event;
	document.body.scrollTop += (e.wheelDelta>0?-1:1)*3*charHeight;
	loCon.updateScroll();
	return false;
};

const clickHandler = (element) => {
	console.log(event);
	
	if(event.clientY < 15) {
		// clicked tabs line
		if(event.target.id.match(/tab\d+/)) {
			// clicked a tab
			loCon.updateTabs(
				"change",
				parseInt(event.target.id.match(/\d+/))
			);
		} else if(event.target.id === "close") {
			// clicked the close button
			loCon.updateTabs("close");
		}
			
	}
};