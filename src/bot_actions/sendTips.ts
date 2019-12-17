import { sendTransaction } from "../smiley/transaction";
import { Account } from "../db";
import { Op } from "sequelize";
import { createAccount, createAddress } from "../smiley/address";
import { getUser } from "../twitter/client";
import { tweet } from "../twitter/client";

interface Mention {
	screen_name: string;
	name: string;
	id: string | number;
	id_str: string;
}

const notifyUser = async (id, tipper, amount) => {
	const { screen_name } = await getUser(id);
	tweet(
		`Hey @${screen_name}, @${tipper} just tipped you ${amount}smly. DM me to retrieve it`
	);
};

export const sendTips = async ({
	user,
	amount,
	mentions
}: {
	user: any;
	amount: number;
	mentions: Mention[];
}) => {
	const { id_str, screen_name } = user;

	const instance: any = await Account.findOne({
		where: {
			twitter_id: id_str
		}
	});

	const plain: any = instance.get({ plain: true });

	const mentionIds = mentions.map(({ id_str: id }) => id);

	mentionIds.forEach(async id => {
		const account = await Account.findOne({
			where: {
				twitter_id: id
			}
		});

		if (!account) {
			const address = await createAddress();
			createAccount(address, id);
			Account.create({
				twitter_id: id,
				address
			});
			notifyUser(id, screen_name, amount);
		}

		await Account.sync();
	});

	const accounts = await Account.findAll({
		where: {
			twitter_id: {
				[Op.in]: mentionIds
			}
		}
	});

	const addressesWithAmounts = accounts.map(account => {
		const plain: any = account.get({ plain: true });
		const { address } = plain;

		return {
			address,
			amount
		};
	});

	const { txid, success, error } = await sendTransaction(
		addressesWithAmounts,
		plain.address
	);

	return {
		success,
		txid,
		error
	};
};
