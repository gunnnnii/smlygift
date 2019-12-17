import { sendTips } from "../bot_actions/sendTips";
import { sendMessage } from "./client";

type EventType = "message_create" | "tweet_create";
interface TwitterEvent {
	type: EventType;
	id: string;
	created_timestamp: string;
}

interface Tweet_create extends TwitterEvent {
	tweet_create: {
		target: {
			recipient_id: string;
		};
		sender_id: string;
		source_app_id?;
		message_data: {
			text: string;
			entities: object;
		};
	};
}

const tipRegexp = /tip:\s*\d+!/g;
const getTipAmount = tweet => {
	const [tip = ""] = tweet.match(tipRegexp) || [];
	const amount = tip.substring(5, tip.length - 1) || 0;
	return +amount;
};

export const tweetMention = (events: any[]) => {
	events.forEach(async event => {
		const { user, entities, text } = event;
		const { user_mentions = [] } = entities;
		const mentions = user_mentions.filter(({ name }) => name !== "Smlygift");
		const amount = getTipAmount(text);

		const { txid, success, error } = await sendTips({ user, amount, mentions });

		if (success) {
			sendMessage(
				`You're tip was successful. Here is the transaction: ${txid}`,
				user.id_str
			);
		} else {
			sendMessage(error.message, user.id_str);
		}
	});
};
