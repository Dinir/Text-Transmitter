// quick dom creator
// accept tag, [classname, id], innerHTML, [childrenNodes].
const dobj = function(tag, names, inner, children, ...moreProps) {
	let newOne = document.createElement(tag);
	
	if(names) {
		if(names.constructor===Array) {
			names[0]?newOne.className = names[0]:"";
			names[1]?newOne.id = names[1]:"";
		} else
			newOne.className = names;
	}
	
	inner? newOne.innerHTML = inner:"";
	
	newOne.appendChildren = function(c) {
		if(c && c.constructor === Array) {
			newOne.appendChildren(...c);
		} else
				for(let i in arguments)
					newOne.appendChild(arguments[i]);
	};
	
	if(children) {
		if(children.constructor === Array)
			newOne.appendChildren(...children);
		else
			newOne.appendChild(children);
	}
	
	if(moreProps) {
		for(let k=0;k<moreProps.length;k+=2) {
			newOne[moreProps[k]] = moreProps[k+1];
		}
	}
	
	return newOne;
};

const changeClass = (target, firstCl, secondCl) => {
	// if first exist = add it
	// if both exist = change first to second
	if(target) {
		if(firstCl) {
			if(!secondCl) {
				target.className += ` ${firstCl}`;
			} else {
				target.className = firstCl==="*"?
					secondCl:
					target.className.replace(new RegExp('\\s?'+firstCl), secondCl===" "?"":secondCl);
			}
		}
	}
};
const replaceDobj = (to, from) => {
	from.parentNode.replaceChild(to,from);
};
const newImgAnchor = addresses => {
	let address = [];
	if(addresses.constructor === Array) {
		if(addresses[0]) address[0] = addresses[0];
		if(addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	const theAnchor = dobj("a","link img",address[0],[],
		"href",`${address[1]?address[1]:address[0]}`,
		"target","_blank"
	);
	return theAnchor.outerHTML;
};
const newLinkAnchor = addresses => {
	let address = [];
	if(addresses.constructor === Array) {
		if(addresses[0]) address[0] = addresses[0];
		if(addresses[1]) address[1] = addresses[1];
	} else {
		address[0] = addresses;
	}
	let theAnchor = dobj("span","link img",address[0],[]);
	theAnchor = theAnchor.outerHTML;
	theAnchor = replaceStr(theAnchor,theAnchor.indexOf(">"),theAnchor.indexOf(">")+1,` onclick='window.open("${address[1]?address[1]:address[0]}")'>`);
	return theAnchor;
}