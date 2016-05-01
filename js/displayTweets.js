let React = require('react');
let ReactDOM = require('react-dom');
//let moment = require('moment');

// use moment to store timestamp
// var test = moment(tss[15].created_at, "ddd MMM D H:mm:ss Z YYYY")

let twitObj = React.createClass({
	propTypes: {
		raw: React.PropTypes.object.isRequired
	},
	render: function() {
		const raw = this.props.raw;
		let timestamp = raw.created_at;
		let username = raw.user.screen_name;
		let text = raw.text;
		let manipulationIndices = [text];

		let isReply =
			raw.entities.user_mentions.length > 0 ||
			raw.in_reply_to_status_id_str !== null;
		let isRetweet = typeof raw.retweeted_status !== "undefined";
		let isQuote = raw.is_quote_status;
		let hasImage = typeof raw.entities.media !== "undefined";
		let hasLink = raw.entities.urls.length > 0;

		// reply info
		// raw.entities.user_mentions
		// {id_str, indices[], screen_name}[]
		// raw.in_reply_to_status_id_str
		// id (in string)
		if(raw.entities.user_mentions.length > 0) {
		}
		if(raw.in_reply_to_status_id_str !== null) {
		}
		if(isRetweet) {
			let userRTed = username;
			let timeRTed = timestamp;
			timestamp = raw.retweeted_status.created_at;
			username = raw.retweeted_status.user.screen_name;
			text = raw.retweeted_status.text;
		}
		if(isQuote) {
			let timeQuote = raw.quoted_status.created_at;
			let userQuote = raw.quoted_status.user.screen_name;
			let textQuote = raw.quoted_status.text;
		}
		if(hasImage) {
			// let images = raw.extended_entities.media.map(function(v) {
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
				<span className="timestamp">{timestamp}</span>
				<span className={`username${isReply?" reply":""}${doesPing?" ping":""}`}>{username}</span>
				<span className="text">{text}</span>
				{isRetweet? (
					<span className="retweet">
						<span className="username">{userRTed}</span>
						<span className="timestamp">{timeRTed}</span>
					</span>
				): null}
				{isQuote? (
					<span className="quote">
						<span className="timestamp">{timeQuote}</span>
						<span className="username">{userQuote}</span>
						<span className="text">{textQuote}</span>
					</span>
				): null}
			</div>
		);
	}
});

function twitObject(rawObj) {
	this.timestamp = rawObj.created_at;
	this.username = rawObj.user.screen_name;
	this.text = rawObj.text;
	
	// TODO make them have more information about their related tweets.
	this.isReply;
	this.isRetweet;
	this.isQuote;
	this.hasImage;
	this.hasLink;
	
	if(this.isReply =
		rawObj.entities.user_mentions.length > 0
		|| rawObj.in_reply_to_status_id_str !== null) {

	}

	if(this.isRetweet = typeof rawObj.retweeted_status !== "undefined") {
		this.timeRTed = this.timestamp;
		this.userRTed = this.username;
		this.timestamp = rawObj.retweeted_status.created_at;
		this.username = rawObj.retweeted_status.user.screen_name;
		this.text = rawObj.retweeted_status.text;
	}

	if(this.isQuote = rawObj.is_quote_status) {
		this.timeQuote = rawObj.quoted_status.created_at;
		this.userQuote = rawObj.quoted_status.user.screen_name;
		this.textQuote = rawObj.quoted_status.text;		
	}
	if(this.hasImage = typeof rawObj.entities.media !== "undefined") {
		// TODO parse the image link on the text, change it to display_url, make it clickable, put a placeholder of function that loads and shows you the image when clicked
	}
	if(this.hasLink = rawObj.entities.urls.length > 0) {
		// TODO also do similar thing to the image functions here!
	}
	
}

let timelineTweets = {};
let tweetMold = "";

window.onload = () => {
	let data = [
		{timestamp: '23:15', username: 'x_nuk', reply: true, pinged: true, text: "@DinirNertan OH YEAH I'M SO AWESOME"},
		{timestamp: '14:58', username: '_30_Java_', text: '30億のデバイスで走るJava', retweet: {username: 'DinirNertan', timestamp: '16:13'}}
	];
	let Quote = ({timestamp, username, text}) => (
		<span className="quote">
			<span className="timestamp">{timestamp}</span>
			<span className="username">{username}</span>
			<span className="text">{text}</span>
		</span>
	);
	let Retweet = ({username, timestamp}) => (
		<span className="retweet">
			<span className="username">{username}</span>
			<span className="timestamp">{timestamp}</span>
		</span>
	);
	let Tweet = ({timestamp, username, reply, pinged, text, quote, retweet}) => (
		<div>
			<span className="timestamp">{timestamp}</span>
			<span className={["username", reply?"reply":"", pinged?"pinged":""].join(' ').trim()}>{username}</span>
			<span className="text">{text}</span>
			{quote?Quote(quote):null}
			{retweet?Retweet(retweet):null}
		</div>
	);
	let Timeline = () => (
		<div id="timeline">
			{data.map(Tweet)}
		</div>
	);
	ReactDOM.render(
		<div>
			<h1>Hello, world!!</h1>
			<Timeline />
		</div>,
		document.getElementById('main')
	);
};