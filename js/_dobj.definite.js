const newImgAnchor = addresses => {
	let address = [];
	if(addresses.constructor === Array) {
		if(addresses[0]) address[0] = addresses[0];
		if(addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("a","link img",address[0],[],
		"href",`${address[1]?address[1]:address[0]}`,
		"target","_blank"
	);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor,theAnchor.indexOf(">"),theAnchor.indexOf(">")+1,` onmouseover="showImageOnMouseMove(1,event,'${address[1]?address[1]:address[0]}')" onmouseout="showImageOnMouseMove(0)">`);
	return theAnchor;
};
const newLinkAnchor = addresses => {
	let address = [];
	if(addresses.constructor === Array) {
		if(addresses[0]) address[0] = addresses[0];
		if(addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("span","link",address[0],[]);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor,theAnchor.indexOf(">"),theAnchor.indexOf(">")+1,` onclick='sh.openExternal("${address[1]?address[1]:address[0]}")'>`);
	return theAnchor;
};
const newHashtagAnchor = addresses => {
	let address = [];
	if(addresses.constructor === Array) {
		if(addresses[0]) address[0] = addresses[0];
		if(addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("span","link",address[0],[]);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor,theAnchor.indexOf(">"),theAnchor.indexOf(">")+1,` onclick='sh.openExternal("${address[1]?address[1]:address[0]}")'>`);
	return theAnchor;
};

const showImageOnMouseMove = function(t,e,a) {
	switch(t) {
		case 1:
			var iv = document.getElementById('imgView').firstChild.firstChild;
			iv.src = a;
			iv.parentNode.parentNode.style.left = (Math.floor((e.x+(e.x>(window.innerWidth/2)?-1*(iv.parentNode.parentNode.getBoundingClientRect().width+3):5))/charWidth)*charWidth)+'px'; // 3, 5: see scss file for section#imgView img!
			iv.parentNode.parentNode.style.top = (Math.floor((e.y+(e.y>(window.innerHeight/2)?-1*(iv.parentNode.parentNode.getBoundingClientRect().height-charHeight):charHeight))/charHeight)*charHeight)+'px';
			break;
		case 0:
			var iv = document.getElementById('imgView');
			iv.style.top = "100%";
			iv.style.left = 0;
			break;
	}
};
const openNewTabFromLink = function() {
	
};
