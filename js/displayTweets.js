let React = require('react');
let ReactDOM = require('react-dom');
let moment = require('moment');

// use moment to store timestamp
// var test = moment(tss[15].created_at, "ddd MMM D H:mm:ss Z YYYY")
/*
const hlsearch = (container, what, spanClass) => {
	let content = container.innerHTML,
		pattern = new RegExp('(>[^<.]*)(' + what + ')([^<.]*)','g'),
		replaceWith = '$1<span ' + ( spanClass ? 'class="' + spanClass + '"' : '' ) + '">$2</span>$3',
		highlighted = content.replace(pattern,replaceWith);
	return (container.innerHTML = highlighted) !== content;
}
*/

const formatTime = {
	init: rawTimeString =>
		moment(rawTimeString, "ddd MMM D H:mm:ss Z YYYY").format("X DD MM YY").split(" "),
	getDate: ([dd,mm,yy]) =>
		moment(["20"+yy,parseInt(mm)-1,dd]),
	relTime: timeString => {
		const p = moment().format("X DD MM YY").split(" ");
		const d = p[0]-timeString[0]; // relative time in second
		if(d<60) { // if less than a minute - return sec
			return (`${d}s`)
		}	else if(d<3600) { // if less than an hour - return min
			return (`${parseInt(d/60)}m`)
		} else if(d<86400) { // if less than a day - return hour
			return (`${parseInt(d/3600)}h`)
		} else if(d<2678400) { // if less than 31 days - return day
			return (`${parseInt(d/86400)}d`)
		} else { // if more than a month - return month or year
			const dd = formatTime.getDate([timeString[1],timeString[2],timeString[3]]).fromNow(true).split(" ");
			return (`${dd[0]==="a"?1:dd[0]}${dd[1][0]==="m"?"M":"y"}`)
		}
		/*} else if(p[3]===timeString[3]) { // if in same year
			if(p[2]===timeString[2]) { // and in same month - return day
				return ("    "+parseInt(d/86400)+"d").slice(-l)
			} else { // and months differ - return MM.DD.
				//return `${timeString[2]}.${timeString[1]}.`
				return ("    "+(p[2]-timeString[2])+"m").slice(-l)
			}
		} else { // if years differ - return YY.MM.DD.
			// return `${timeString[3]}.${timeString[2]}.${timeString[1]}`

		}*/
	}
};

// TODO make contents type, so it can tell the thing it is about to render is whether a tweet, a message frame, or anything other.
// make separate routines for each case of types, let them prepare rendering stuff, put the result in render function.
// I might need to use `ComponentWillReceiveProps` or something.
const DtwitObj = React.createClass({
	propTypes: {
		raw: React.PropTypes.object.isRequired
	},
	renderTwit: function() {

	},
	render: function() {
		const raw = this.props.raw;
		var timestamp = formatTime.init(raw.created_at);
		var username = raw.user.screen_name;
		var text = raw.text;
		var manipulationIndices = [text];

		var isReply =
			raw.entities.user_mentions.length > 0 ||
			raw.in_reply_to_status_id_str !== null;
		var doesPing = false;
		var isQuote = raw.is_quote_status;
		var isRetweet = typeof raw.retweeted_status !== "undefined";
		var hasImage = typeof raw.entities.media !== "undefined";
		var hasLink = raw.entities.urls.length > 0;

		// reply info
		// raw.entities.user_mentions
		// {id_str, indices[], screen_name}[]
		// raw.in_reply_to_status_id_str
		// id (in string)
		if(raw.entities.user_mentions.length > 0) {
		}
		if(raw.in_reply_to_status_id_str !== null) {
		}
		if(isQuote) {
			if(raw.quoted_status) {
				var timeQuote = formatTime.init(raw.quoted_status.created_at);
				var userQuote = raw.quoted_status.user.screen_name;
				var textQuote = raw.quoted_status.text;
			} else { // this is the case where RTed tweet has quote in it
				var timeQuote = formatTime.init(raw.retweeted_status.quoted_status.created_at);
				var userQuote = raw.retweeted_status.quoted_status.user.screen_name;
				var textQuote = raw.retweeted_status.quoted_status.text;
			}
		}
		if(isRetweet) {
			var userRTed = username;
			var timeRTed = timestamp;
			timestamp = formatTime.init(raw.retweeted_status.created_at);
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if(hasImage) {
			// var images = raw.extended_entities.media.map(function(v) {
			// 	manipulationIndices.push([...v.indices,]);
			// 	return {
			// 		indices:v.indices,
			// 		url:v.media_url_https
			// 	}
			// });
			raw.extended_entities.media.forEach(
				v => {
					manipulationIndices.push([
						...v.indices,
						(
							1
						)
					]);
				}
			);
		}
		// TODO I can make it so multiple quotes can be shown as quoted statuses.
		if(hasLink) {
		}

		return (
			<div>
				<span className="timestamp">{formatTime.relTime(timestamp)}</span>
				<span className={`username${isReply?" reply":""}${doesPing?" ping":""}`}>{username}</span>
				<span className="text">{text}</span>
				{isQuote? (
					<span className="quote">
						<span className="timestamp">{formatTime.relTime(timeQuote)}</span>
						<span className="username">{userQuote}</span>
						<span className="text">{textQuote}</span>
					</span>
				): null}
				{isRetweet? (
					<span className="retweet">
						<span className="username">{userRTed}</span>
						<span className="timestamp">{formatTime.relTime(timeRTed)}</span>
					</span>
				): null}
			</div>
		);
	}
});
const Dtabs = React.createClass({
	propTypes: {
		tlOrder: React.PropTypes.array.isRequired,
		tlCurrent: React.PropTypes.number,
		changeTabFocus: React.PropTypes.func.isRequired,
		closeTab: React.PropTypes.func.isRequired
	},
	render: function() {

		return (
			<section id="tabs" className="hl">
				{this.props.tlOrder.map((v, i) => {
					return (
						<span onClick={()=>this.props.changeTabFocus(i)} key={i} className={i === this.props.tlCurrent? "chosen": null}>
							{tl.get(v).notifications > 0? (
								<span className="notifications">{tl.get(v).notifications}</span>
							): null}
							[{v}]
						</span>
					)
				})}
				<span onClick={()=>this.props.closeTab(this.props.tlCurrent)} id="close" >X</span>
			</section>
		)
	}
});
const Dcontent = React.createClass({
	propTypes: {
		isTweets: React.PropTypes.bool.isRequired,
		needThreadFor: React.PropTypes.array,
		currentTweets: React.PropTypes.array
	},
	getDefaultProps: () => ({
		isTweets: false,
		needThreadFor: [],
		currentTweets: []
	}),
	render: function() {
		return (
			<section id="main">
				<div>{this.props.tabName}</div>
				{

					// tl.get(this.props.tabName).tweets.map(
					// 	(v,i) => {
					// 		return (
					// 			<DtwitObj key={i} raw={v} />
					// 		)
					// 	}
					// )
				}
			</section>
		)
	}
});
const Dcontrols = React.createClass({
	propTypes: {
		receivingCommand: React.PropTypes.bool.isRequired,
		value: React.PropTypes.string,
		receiveValueChange: React.PropTypes.func.isRequired,

		currentPosition: React.PropTypes.number,
		apiCallLeft: React.PropTypes.number,
		apiCallMax: React.PropTypes.number,

		cmdPrefix: React.PropTypes.string,
		charCount: React.PropTypes.number,
		charMax: React.PropTypes.string
	},
	getDefaultProps: () => ({
		receivingCommand: false,
		value: "",

		currentPosition: 0,
		apiCallLeft: 0,
		apiCallMax: 0,

		cmdPrefix: ":",
		charCount: 0,
		charMax: 0

	}),

	render: function() {
		return (
			<section id="controls">
				<div id="status">
					<div className="left">&nbsp;</div>
					<div className="rightText">
						<span style={{width: charWidth+"px"}}>&nbsp;</span>
						<span id="currentLine">{this.props.currentPosition}%</span>
						<span id="api">{this.props.apiCallLeft}/{this.props.apiCallMax}</span>
					</div>
				</div>
				<div id="commandInput">
					<div id="commandContext">
						<div className="left">
							<span className="text">{this.props.context}</span>
							<div className="rightText">
								{this.props.charCount}/{this.props.charMax}
							</div>
						</div>
					</div>
					<input type="text" id="query" value={this.props.value} onChange={this.props.receiveValueChange} maxlength="80" />
				</div>
			</section>
		)
	}
});
const DimgView = React.createClass({
	propTypes: {
		show: React.PropTypes.bool
	},
	getDefaultProps: () => ({
		show: false
	}),
	componentWillReceiveProps: n => {
		document.getElementById("imgView"); //n.show?
	},
	render: function() {
		return 	(
			<section id="imgView">
				<div>
					<img />
				</div>
			</section>
		)
	}
});

const Dmain = React.createClass({
	getInitialState: () => ({
		width: 80,
		height: 24,

		tl: new Map(),
		tlOrder: [],
		tlCurrent: 0,
		twitsNeedingThread: [],

		commandBufferValue: "",
		receivingCommand: false,
		lastKeyCode: null,

		currentPosition: 0,
		visibleLine: 0,
		apiCallLeft: 0,
		apiCallMax: 15,

		cmdPrefix: "",
		charCount: 0,
		charMax: "0",
	}),

	componentWillMount: function() {
		this.setState(loadSettings());
		this.cmdresize(this.state.width, this.state.height);
		document.addEventListener("keydown", this.ctlreceiveKey);
		document.addEventListener("keyup", this.ctltidyKey);
		document.body.addEventListener("mousewheel", this.ctlhandleScroll, false);
	},
	componentWillUnmount: function() {
		saveSettings(this.state);
		document.removeEventListener("keydown", this.ctlreceiveKey);
		document.removeEventListener("keyup", this.ctltidyKey);
		document.body.removeEventListener("mousewheel", this.ctlhandleScroll, false);
	},

	render: function() {
		return (
			<div>
				<Dtabs
					hidden={this.state.tlOrder.length<=1}
					changeTabFocus={this.changeTabFocus}
					closeTab={this.closeTab}
					tlOrder={this.state.tlOrder}
					tlCurrent={this.state.tlCurrent}
				/>
				<Dcontent
				  needThreadFor={this.state.twitsNeedingThread}
				/>
				<Dcontrols
					receivingCommand={this.state.receivingCommand}
					currentPosition={this.state.currentPosition}
					cmdPrefix={this.state.cmdPrefix}
					charCount={this.state.charCount}
					charMax={this.state.charMax}
					value={this.state.commandBufferValue}
					receiveValueChange={this.ctlreceiveValueChange}
				/>
				<DimgView />
			</div>
		)
	},

	// command buffer controls

	cmdresize: function(w=this.state.width,h=this.state.height) {
		window.resizeTo((w>12?w:12)*charWidth, (h>7?h:7)*charHeight);
		this.setState({width: w, height: h});
	},
	cmdrs: function(w,h) { return this.cmdresize(w,h) },
	cmdadd: function(name,uri=EndpointDefault[name].uri,pos) {
		const param = EndpointDefault[name].param==="undefined"?{}:EndpointDefault[name].param;
		tlCon.tab.add(name,uri,param,pos);
	},
	executeCommand: function(command) {
		let prefix = command.slice(0,1);
		let argv = command.trim().substr(1).split(" ");debugger;
		switch(prefix) {
			case ":": this[`cmd${argv.shift()}`](...argv); break;
			case "/": break;
			case "r": break;
		}
	},

	ctlreceiveValueChange: function(e) {
		this.setState({
			commandBufferValue: e.target.value,
			cmdPrefix: e.target.value[0],
			charCount: e.target.value.length
		});
	},

	ctlreceiveKey: function(e) {
		this.setState({lastKeyCode: e.keyCode});
		// console.log(`${e.type} ${e.keyCode} ${e.code} ${e.charCode}`);
		//e.preventDefault();
		// const query = document.getElementById("query");

		// scroll a page when presses 'PgUp/Dn'
		if(e.keyCode===33 || e.keyCode===34) {
			document.body.scrollTop += (e.keyCode===33?-1:1)*(window.innerHeight-2*charHeight);
		}

		if(!receivingCommand) { // when the buffer is closed
			// ':' or '/' to open buffer
			if(e.shiftKey && e.keyCode===186 || e.keyCode===191)
				this.ctltoggleCommand();

		} else { // when the buffer is open

			// 'esc' or 'enter' to close buffer.
			if(e.keyCode===27 || e.keyCode===13) {
				if(e.keyCode===13) {this.executeCommand(this.state.commandBufferValue); debugger;}
				this.ctltoggleCommand();
			}
		}
	},
	ctltidyKey: function() {
		// const query = document.getElementById("query");
		// if buffer got emptied after a keypress close it
		if(!this.state.receivingCommand) {} else {
			if(this.state.lastKeyCode)
				if(this.state.commandBufferValue.length===0)
					this.ctltoggleCommand();
		}
	},
	ctlhandleScroll: function() {
		const e = window.event;
		document.body.scrollTop += (e.wheelDelta>0?-1:1)*3*charHeight;
		return false;
	},

	ctltoggleCommand: function() {
		const status = document.getElementById("status");
		const commandInput = document.getElementById("commandInput");
		if(this.state.receivingCommand) {
			this.state.commandBufferValue = "";
			status.style.display = "inherit";
			commandInput.style.display = "none";
		} else {
			status.style.display = "none";
			commandInput.style.display = "inherit";
			document.getElementById("query").focus();
		}
		this.setState(function(ps){return {receivingCommand: !ps.receivingCommand}});
	},

	// command buffer informations

	setCharMax: function() {
		switch(this.state.cmdPrefix) {
			case ":": this.setState({charMax: 0}); break;
			case "/": this.setState({charMax: 0}); break;
			case "r": this.setState({charMax: 140}); break;
		}
	},

	// tab controls

	changeTabFocus: function(tlOrderNumber) {
		this.setState({tlCurrent: tlOrderNumber});

	},
	closeTab: function(currentTabToRemove) {
		tlCon.tab.remove(tlOrder[currentTabToRemove]);
		this.setState({
			tlOrder: tlOrder,
			tlCurrent: tlCurrent
		});
	},

	tab: {
		// that address should not be encouraged to be filled manually by users. it's the one listed in https://dev.twitter.com/rest/public.
		// that parameters also should not be encouraged to be filled manually by users. We will make a dictionary to refer for each of addresses and get needed ones to fill from.
		add: function(tabName, address, parameters, position) {
			if(!tl.has(tabName)
			   && typeof tabName !== "undefined"
			   && tlOrder.indexOf(tabName) === -1) {
				let v = {
					type:address,
					params:parameters,
					tweets:[],
					notifications:0
				};
				// if(streamURI.indexOf(tabName)>=0)
				// 	v.notifications=0;
				tl.set(tabName, v);
				if(typeof position==="undefined")
					tlOrder.push(tabName);
				else
					tlOrder.splice(position, 0, tabName);
				tlCurrent = tlOrder.indexOf(tabName);
			}
		},
		remove: function(tabName) {
			if(tlCurrent>0 &&
			   tlCurrent===tlOrder.length-1)
				tlCurrent--;
			tl.delete(tabName);
			tlOrder.splice(tlOrder.indexOf(tabName),1);
		},
		flush: function(really) {
			if(really === "y" || really === "Y")
				tl.forEach(function(v, k) {tl.delete(k);})
		},
		rename: function(tabName, alterName) {
			if(typeof tabName !== "undefined"
			   && typeof alterName !== "undefined"
			   && tl.has(tabName)
			   && !tl.has(alterName)
			   && tlOrder.indexOf(tabName) > -1
			   && tlOrder.indexOf(alterName) === -1) {
				let contents = tl.get(tabName);
				tl.set(alterName, contents);
				tlOrder.splice(tlOrder.indexOf(tabName), 1, alterName);
				tl.delete(tabName);
			}
		},
		reorder: function(tabName, place, swap) {
			if(typeof tabName !== "undefined") {
				if(typeof swap !== "undefined") {
					tlOrder.splice(place, 0, ...tlOrder.splice(tlOrder.indexOf(tabName), 1));
				} else {
					let placeSwap = tlOrder.indexOf(tabName);
					tlCon.tab.reorder(tabName, place);
					tlCon.tab.reorder(tlOrder[place-1], placeSwap);
				}
			}
		}
	},
	recentCall: false,
	update: function(tabName, direction, actions) {
		if(tlCon.recentCall) {} else {
			tlCon.recentCall = true;
			let contents = tl.get(tabName);
			let tweets = contents.tweets;
			let params = contents.params;
			let notifications = contents.notifications;

			// TODO make it check if the type can use `since_id` and `max_id` first.
			switch(direction) {
				case 1:
					if(tweets[0]) {
						contents.params.since_id = tweets[0].id_str;
						contents.params.max_id = undefined;
					}
					break;
				case -1:
					if(tweets[tweets.length-1]) {
						contents.params.max_id = tweets[tweets.length-1].id_str;
						contents.params.since_id = undefined;
					}
					break;
			}

			t.get(contents.type, params, function(err,data,response){
				/*TODO check if received data should attach to or replace the previous data.
					for some of the api address the `direction` is meaningless
				and the data received should replace old data instead of attaching to it.
					but we're only testing for home, mention, user timeline at the moment
				so the default behavior will be adding the data to the old one.*/
				// TODO learn what errors and response are for.
				switch(direction) {
					case 1:
						contents.tweets = data.concat(tweets);
						break;
					case -1:
						contents.tweets.pop();
						contents.tweets = tweets.concat(data);
						break;
					case 0: // for those which doesn't need previous datas?
						contents.tweets = data;
						break;
				}
				tl.set(tabName, contents);
				tlCon.recentCall = false;
				actions();
				console.log("done");
			}); // t.get
		} // if-else tlCon.recentCall
	} // update

});