import { Autohook } from "twitter-autohook";
import { directMessage } from "./direct_messaging";
import { tweetMention } from "./tweets";

const {
	TWITTER_CONSUMER_KEY: consumer_key,
	TWITTER_CONSUMER_SECRET: consumer_secret,
	TWITTER_ACCESS_TOKEN: token,
	TWITTER_ACCESS_TOKEN_SECRET: token_secret,
	TWITTER_WEBHOOK_ENV: env
} = process.env;

export const twitter = async () => {
	const webhook = new Autohook({
		consumer_key,
		consumer_secret,
		token,
		token_secret,
		env
	});

	webhook.on("event", event => {
		const { tweet_create_events, direct_message_events } = event;
		if (direct_message_events) {
			directMessage(direct_message_events);
		}
		if (tweet_create_events) {
			tweetMention(tweet_create_events);
		}
	});

	await webhook.removeWebhooks().then(e => console.log("All webhooks cleared"));
	await webhook.start();

	await webhook.subscribe({
		oauth_token: token,
		oauth_token_secret: token_secret
	});
};
