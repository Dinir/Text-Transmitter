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

const DtwitObj = React.createClass({
	propTypes: {
		raw: React.PropTypes.object.isRequired
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
const Dtabs =  React.createClass({
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
const Dtweets = React.createClass({
	propTypes: {
		tabName: React.PropTypes.string
	},
	/*update: function() {
		if(tl.get(this.props.tabName).tweets.length===0) {
			tlCon.update(this.props.tabName, 1, )
		}
	},*/
	render: function() {
		return (
			<section id="main">
				<div>{this.props.tabName}</div>
				{

					// tl.get(this.props.tabName).tweets.map(
					// 	(v,i) => {
					// 		return (
					// 			<display.twitObj key={i} raw={v} />
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
		currentLine: React.PropTypes.number,
		apiCallLeft: React.PropTypes.number
	},
	getDefaultProps: () => ({
		receivingCommand: false,
		currentLine: 0,
		apiCallLeft: 0
	}),

	render: function() {
		return (
			<section id="controls">
				<div id="status">
					<div className="left">&nbsp;</div>
					<div className="rightText">
						<span style={{width: charWidth+"px"}}>&nbsp;</span>
						<span id="currentLine">{this.props.currentLine}%</span>
						<span id="api">{this.props.apiCallLeft}/{apiCallMax}</span>
					</div>
				</div>
				<div id="commandInput">
					<div id="commandContext">
						<div className="left">
							replying to
							<span className="username">DinirNertan</span>:
							<span className="text">I ate an ice cream a...</span>
							<div className="rightText">
								81/140
							</div>
						</div>
					</div>
					<input type="text" id="query" maxlength="80" />
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
		document.getElementById("imgView")//n.show?
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
