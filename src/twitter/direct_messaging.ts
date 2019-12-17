import {
	addReturnAddress,
	InvalidAddressError
} from "../bot_actions/addReturAddress";
import { sendMessage, getUser } from "./client";
import { withdraw } from "../bot_actions/withdraw";
import { deleteAccount } from "../bot_actions/deleteAccount";
import { getUserBalance } from "../smiley/address";

type EventType = "message_create" | "";
interface TwitterEvent {
	type: EventType;
	id: string;
	created_timestamp: string;
}

interface Message_create extends TwitterEvent {
	message_create: {
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

export const sendHelpMessage = sender_id =>
	sendMessage(
		`I understand 4 commands:
	 - address: {smileycoin address}!
	 -> Registers a return address to your twitter handle to withdraw all your tips to
	 - withdraw!
	 -> Sends all your tips to the registered return address
	 - delete!
	 -> Withdraws your funds into your return address and deletes your account
	 - balance!
	 -> Sends you information about your balance, such as the amount and address
	 - help! (this command)`,
		sender_id
	);

const sendBalanceMessage = async sender_id => {
	const { balance, address } = await getUserBalance(sender_id);
	sendMessage(
		`The amount in your balance is: ${balance}smly
		Your address is ${address}`,
		sender_id
	);
};

export const dmRegexp = /((address:\s*.{34})|(balance)|(withdraw)|(delete)|(help))!/gi;

export const dmAction = async (op, sender, params) => {
	const { id_str: userId } = await getUser(sender);
	switch (op.toLowerCase()) {
		case "address":
			const { address } = params;
			if (!address) {
				sendMessage("", sender);
			} else {
				addReturnAddress(address, userId)
					.then(({ address, updated }) => {
						if (updated) {
							sendMessage(`Account updated successfully`, sender);
						} else {
							sendMessage(
								`Account created successfully, you can now deposit your funds to ${address}`,
								sender
							);
						}
					})
					.catch(error => {
						if (error instanceof InvalidAddressError) {
							sendMessage("Invalid address baby", sender);
						} else {
							sendMessage(
								"An unknown error occurred, please try again later",
								sender
							);
							console.error(error);
						}
					});
			}
			break;
		case "withdraw!":
			withdraw(userId).then(({ success, error }) => {
				if (success) {
					sendMessage(
						"Your funds have successfully been withdrawn to the return address",
						sender
					);
				} else {
					sendMessage(error, sender);
				}
			});
			break;
		case "delete!":
			deleteAccount(userId).then(({ success, error }) => {
				if (success) {
					sendMessage(
						"Your funds have been withdrawn to your return address and the account has successfully been deleted",
						sender
					);
				} else {
					sendMessage(error, sender);
				}
			});
			break;
		case "balance!":
			sendBalanceMessage(sender);
			break;
		case "help!":
			sendHelpMessage(sender);
			break;
		default:
			sendMessage(
				"Sorry, I didn't understand that. Type help! to get help",
				sender
			);
	}
};

export const directMessage = (events: Message_create[]) => {
	// run query to add a return address to the account
	events.forEach(async event => {
		const {
			message_data: { text },
			sender_id,
			source_app_id
		} = event.message_create;

		if (source_app_id) return;
		// get handle, update account
		const op = text.match(dmRegexp)?.[0]?.split(":") || [""]; // prettier-ignore eslint-ignore-line
		try {
			await dmAction(op[0], sender_id, {
				address: op[1]?.trim().substring(0, op[1].length - 2)
			});
		} catch (e) {
			console.log(e);
		}
	});
};
