import { Account } from "../db";
import {
	createAddress,
	validateAddress,
	createAccount
} from "../smiley/address";

export class InvalidAddressError extends Error {}

export const addReturnAddress = async (address: string, twitter_id: string) => {
	const valid = await validateAddress(address);
	const tipAddress = await createAddress();

	const [instance, created] = await Account.findOrCreate({
		where: { twitter_id }
	});
	const plain: any = instance.get({ plain: true });

	const { address: currAddress, return_address } = plain;
	const newRegister = created || !Boolean(return_address);

	if (valid) {
		await instance.update({
			address: created ? tipAddress : currAddress,
			return_address: address
		});
		if (created) {
			await createAccount(tipAddress, twitter_id);
		}

		Account.sync();
	} else {
		throw new InvalidAddressError("address is not valid");
	}

	return { address: tipAddress, updated: !newRegister };
};
