const layout = {
	wrapper: null,
	tabs: null,
	main: null,
	controls: null,
	imgView: null,
	
	selectorPos: 0,
	currentLine: dobj("span",[,"currentLine"],"BOT"),
	cmdContext: dobj("div","left","",[dobj("div","rightText","")])
};

// layout controller.
const loCon = {
	updateTabs: (eventType, clickedNumber) => {
		switch (eventType) {
			case "change":
				if(tlCurrent!==clickedNumber) {
					if(layout.tabs.tabDoms[tlCurrent])
						changeClass(layout.tabs.tabDoms[tlCurrent], "chosen", " ");
					changeClass(layout.tabs.tabDoms[clickedNumber], "chosen");
					tlCurrent = clickedNumber;
				}
				loCon.updateMain();
				break;
			case "close":
				tlCon.tab.remove(tlOrder[tlCurrent]);
				loCon.updateTabs();
				loCon.updateMain();
				break;
			default:
				layout.tabs = new display.tabObj(tlOrder);
				layout.tabs.make();
				replaceDobj(layout.tabs, document.getElementById("tabs"));
				break;
		}
	},
	updateMain: () => {
		if(layout.main && layout.main.children[layout.selectorPos]) {
			loCon.updateSelector(-2);
		}
		layout.main = dobj("section",[,"main"],"");
		layout.main.appendChildren(...tl[tlOrder[tlCurrent]].tweets);
		replaceDobj(layout.main, document.getElementById("main"));
		loCon.updateSelector();
	},
	updateStatus: () => {
		
	},
	updateSelector: direction => {
		switch(direction) {
			case 1: // going up
				if(layout.selectorPos>0) {
					changeClass(layout.main.children[layout.selectorPos--], "cursor", " ");
					changeClass(layout.main.children[layout.selectorPos], "cursor");
				}
				break;
			case -1: // going down
				if(layout.selectorPos<tl[tlOrder[tlCurrent]].tweets.length-1) {
					changeClass(layout.main.children[layout.selectorPos++], "cursor", " ");
					changeClass(layout.main.children[layout.selectorPos], "cursor");
				}
				break;
			case -2: // remove current selector indicatior
				if(layout.main && layout.main.children)
				changeClass(layout.main.children[layout.selectorPos], "cursor", " ");
				break;
			case -3: // remove selector through loop
				if(layout.main && layout.main.children) {
					for(let i in layout.main.children){
						changeClass(layout.main.children[i], "cursor", " ");
					}
				}
				break;
			default: // keep the position between tabs
					// changeClass(layout.main.children[layout.selectorPos], "cursor", " ");
				if(layout.selectorPos >= tl[tlOrder[tlCurrent]].tweets.length) {
				layout.selectorPos = tl[tlOrder[tlCurrent]].tweets.length!=0?tl[tlOrder[tlCurrent]].tweets.length-1:0;
			}
					changeClass(layout.main.children[layout.selectorPos], "cursor");
				break;
		}
		if(layout.selectorPos===0) {
			// if current pos is the first position
			window.scrollTo(0, 0); // just scroll to the top
		} else if(layout.main.children[layout.selectorPos].offsetTop-15<document.body.scrollTop) {
			// if the current item is above the screen
			window.scrollTo(0,layout.main.children[layout.selectorPos].offsetTop-15); // just scroll up to the start position of the item
		} else if(layout.selectorPos===tl[tlOrder[tlCurrent]].tweets.length-1) {
			// if current pos is the last position
			window.scrollTo(0,layout.main.clientHeight); // just scroll to the end
		} else if(layout.main.children[layout.selectorPos+1] && layout.main.children[layout.selectorPos+1].offsetTop>document.body.scrollTop+window.innerHeight-15) {
			// if the next item is below the screen
			window.scrollTo(0,layout.main.children[layout.selectorPos+1].offsetTop-window.innerHeight+15); // scroll to next item's start position - current window height
		}
		loCon.updateScroll();
	},
	updateScroll: () => {
		// 30 is from each end of the screen: tab line, status line: 2 line makes 30 pixel height.
		if(layout.main) {
			const scrollPos = parseInt(document.body.scrollTop/(layout.main.clientHeight-(window.innerHeight-30))*10000)/100+"%";
			if(scrollPos==="100%")
				layout.currentLine.innerHTML = "BOT";
			else
				layout.currentLine.innerHTML = scrollPos;
		}
	},
	// what does it do is changing parts of string:
	// from: abcde<div class='rightText'>fghij</div>
	// to  : newText<div class='rightText'>newRightText</div>
	cmdContextUpdate: () => {
		layout.cmdContext.innerHTML = layout.cmdContext.innerHTML
      .replace(/^.*(<div.+>).*<\/div>/,
			`${cmdContextText}\$1${cmdContextRightText}<\/div>`)
	},
	init: () => {
		layout.wrapper = dobj("article", "", "", [	]);
		layout.tabs = new display.tabObj(tlOrder);
		layout.main = dobj("section",[,"main"],"");
		layout.controls = dobj("section",[,"controls"],"",[
			dobj("div",[,"status"],"",[
				dobj("div","left","&nbsp;"),
				dobj("div","rightText","",[
					dobj("span","","&nbsp;",[],"style","width: 8px;"),
					layout.currentLine,
					dobj("span",[,"api"],"")
				])
			]),
			dobj("div",[,"commandInput"],"",[
				dobj("div",[,"commandContext"],"",[
					layout.cmdContext
				]),
				dobj("input",[,"query"],"",[],"type","text")
			])
		]);
		// this is a placeholder. :(
		layout.imgView = dobj("section",[,"imgView"],"",[
			dobj("div","","",[dobj("img")])
		]);
		
		layout.wrapper.appendChildren(
			layout.tabs,
			layout.main,
			layout.controls,
			layout.imgView
		);
		// document.body.appendChild(layout.wrapper);
		replaceDobj(layout.wrapper, document.body.firstChild);
		loCon.updateTabs();
	}
	
};