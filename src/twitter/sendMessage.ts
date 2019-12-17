const messageUrl =
	"https://api.twitter.com/1.1/direct_messages/events/new.json";

const {
	TWITTER_ACCESS_TOKEN: token,
	TWITTER_ACCESS_TOKEN_SECRET: token_secret
} = process.env;

export const sendMessage = async (message: string, recipient: string) => {
	const body = {
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
	};

	const resp = await fetch(messageUrl, {
		method: "POST",
		headers: {
			authorization: ``
		}
	});
};
