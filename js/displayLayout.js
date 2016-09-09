// layout controller.
const loCon = {
	cmdContext: dobj("div","left","",[dobj("div","rightText","")]),
	// what does it do is changing parts of string:
	// from: abcde<div class='rightText'>fghij</div>
	// to  : newText<div class='rightText'>newRightText</div>
	cmdContextUpdate: () => {
		cmdContext.innerHTML = cmdContext.innerHTML
      .replace(/^(.*)(<div.+>)(.*)<\/div>/,
			`${cmdContextText}\$2${cmdContextRightText}<\/div>`)
	},
	init: () => {
		const wrapper = dobj("article", "", "", [	]);
		const tabs = new display.tabObj(tlOrder);
		const main = null;
		const controls = dobj("section",[,"controls"],"",[
			dobj("div",[,"status"],"",[
				dobj("div","left","&nbsp;"),
				dobj("div","rightText","",[
					dobj("span","","&nbsp;",[],"style","width: 8px;"),
					dobj("span",[,"currentLine"],"0%"),
					dobj("span",[,"api"],"")
				])
			]),
			dobj("div",[,"commandInput"],"",[
				dobj("div",[,"commandContext"],"",[
					loCon.cmdContext
				]),
				dobj("input",[,"query"],"",[],"type","text")
			])
		]);
		// this is a placeholder. :(
		const imgView = dobj("section",[,"imgView"],"",[
			dobj("div","","",[dobj("img")])
		]);
	}
	
};