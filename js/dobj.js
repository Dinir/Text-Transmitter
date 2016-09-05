// quick dom creator
// accept tag, [classname, id], innerHTML, [childrenNodes].
const dobj = function(tag, names, inner, children) {
	let newOne = document.createElement(tag);
	
	if(names.constructor === Array) {
		names[0]? newOne.className = names[0]:"";
		names[1]? newOne.id = names[1]:"";
	} else
		newOne.className = names;
	
	inner? newOne.innerHTML = inner:"";
	
	// custom methods and properties goes below here
	newOne.appendChildren = function(c) {
		for(let i in arguments)
			newOne.appendChild(arguments[i]);
	};
	if(children) {
		if(children.constructor === Array)
			newOne.appendChildren(...children);
		else
			newOne.appendChild(children);
	}
	
	return newOne;
};

const changeClass = (target, firstCl, secondCl) => {
	// if first exist = add it
	// if both exist = change first to second
	if(firstCl) {
		if(!secondCl) {
			target.className += ` ${firstCl}`;
		} else {
			target.className = firstCl==="*"?
				secondCl:
				target.className.replace(new RegExp('\\s?'+firstCl), secondCl);
		}
	}
};