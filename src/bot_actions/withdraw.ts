import { Account } from "../db";
import { withdrawTransaction } from "../smiley/transaction";

export const withdraw = async twitter_id => {
	const instance = await Account.findOne({
		where: { twitter_id }
	});

	if (!instance) {
		return {
			success: false,
			error: "No account by this id"
		};
	}

	const plain: any = instance.get({ plain: true });
	const { address, return_address } = plain;
	return withdrawTransaction(twitter_id, address, return_address);
};
