import { post, get } from "request-promise-native";

const base = "https://api.twitter.com/1.1";

const {
	TWITTER_CONSUMER_KEY: consumer_key,
	TWITTER_CONSUMER_SECRET: consumer_secret,
	TWITTER_ACCESS_TOKEN: access_token_key,
	TWITTER_ACCESS_TOKEN_SECRET: access_token_secret
} = process.env;

const oauth = {
	consumer_key: consumer_key,
	consumer_secret: consumer_secret,
	token: access_token_key.trim(),
	token_secret: access_token_secret.trim()
};

export const sendMessage = async (message, recipient) => {
	const res = await post({
		url: `${base}/direct_messages/events/new.json`,
		oauth,
		json: {
			event: {
				type: "message_create",
				message_create: {
					target: {
						recipient_id: recipient
					},
					message_data: {
						text: message
					}
				}
			}
		}
	});
};

export const tweet = async message => {
	const res = await post({
		url: `${base}/statuses/update.json`,
		oauth,
		qs: {
			status: message
		}
	});
	console.log(res.statusCode, res.body);
};

export const getUser = async user_id => {
	const res = await get({
		url: `${base}/users/lookup.json`,
		oauth,
		qs: {
			user_id
		}
	});

	const json = JSON.parse(res);
	return json[0];
};
