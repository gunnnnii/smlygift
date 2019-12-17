import { Account } from "../db";
import { withdraw } from "./withdraw";
import { transactionError, withdrawTransaction } from "../smiley/transaction";

export const deleteAccount = async twitter_id => {
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
	const { success, error } = await withdrawTransaction(
		twitter_id,
		address,
		return_address
	);

	if (!success && error.type !== transactionError.fundingError) {
		return {
			success,
			error
		};
	}

	const deleted = await Account.destroy({
		where: {
			twitter_id
		}
	});

	if (!deleted) {
		return {
			success: false,
			error:
				"Something went wrong when deleting your account, but the funds were successfully withdrawn"
		};
	}

	return {
		success: true
	};
};
