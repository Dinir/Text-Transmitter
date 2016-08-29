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


const display = {
	twitObj: React.createClass({
		propTypes: {
			raw: React.PropTypes.object.isRequired
		},
		render: function() {
			const raw = this.props.raw;
			var timestamp = "00:00"; //raw.created_at;
			var username = raw.user.screen_name;
			var text = raw.text;
			var manipulationIndices = [text];

			var isReply =
				raw.entities.user_mentions.length > 0 ||
				raw.in_reply_to_status_id_str !== null;
			var doesPing = false;
			var isRetweet = typeof raw.retweeted_status !== "undefined";
			var isQuote = raw.is_quote_status;
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
			if(isRetweet) {
				var userRTed = username;
				var timeRTed = timestamp;
				timestamp = "00:01"; //raw.retweeted_status.created_at;
				username = raw.retweeted_status.user.screen_name;
				text = raw.retweeted_status.text;
			}
			if(isQuote) {
				var timeQuote = "00:02"; //raw.quoted_status.created_at;
				var userQuote = raw.quoted_status.user.screen_name;
				var textQuote = raw.quoted_status.text;
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
					<div className="threadPrev"></div>
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
					<div className="threadAfter"></div>
				</div>
			);
		}
	}),
	tabs: React.createClass({
		propTypes: {
			tlOrderArray: React.PropTypes.array.isRequired
		},
		getInitialState: function() {
			return ({order: this.props.tlOrderArray})
		},
		

		render: function() {

			return (
				<section id="tabs" className="hl">
					{this.state.order.map((v, i) => {
						return (
							<span key={i} className={i === tlCurrent? "chosen": null}>
								{typeof tl.get(v).notifications !== "undefined"? (
									<span className="notifications">0</span>
								): null}
								[{v}]
							</span>
						)
					})}
					<span id="close" >X</span>
				</section>
			)
		}
	})
};
