const layout = {
	wrapper: null,
	tabs: null,
	main: null,
	controls: null,
	imgView: null,
	
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
				break;
			default:
				layout.tabs = new display.tabObj(tlOrder);
				layout.tabs.make();
				replaceDobj(layout.tabs, document.getElementById("tabs"));
				break;
		}
		loCon.updateScroll();
	},
	updateMain: () => {
		layout.main = dobj("section",[,"main"],"");
		layout.main.appendChildren(tl.get(tlOrder[tlCurrent]).tweets);
		replaceDobj(layout.main, document.getElementById("main"));
		loCon.updateScroll();
	},
	updateStatus: () => {
		
	},
	updateScroll: () => {
		const scrollPos = parseInt(document.body.scrollTop/(layout.main.clientHeight-330)*10000)/100+"%";
		if(scrollPos==="100%")
			layout.currentLine.innerHTML = "BOT";
		else
			layout.currentLine.innerHTML = scrollPos;
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
		document.body.appendChild(layout.wrapper);
		loCon.updateTabs();
	}
	
};