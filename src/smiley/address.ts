import { smileycoinProcess, SmileyCommand } from "./smileycoin-cli_process";

export const validateAddress = async (address: string) =>
	await smileycoinProcess(
		SmileyCommand.validateAddress,
		result => {
			const json = JSON.parse(result);
			return json.isvalid;
		},
		address
	);

export const createAddress = async () =>
	(
		await smileycoinProcess(SmileyCommand.createAddress, result => result)
	).trim();

export const createAccount = async (address: string, twitter_id) =>
	await smileycoinProcess(
		SmileyCommand.setAccount,
		() => {},
		address,
		twitter_id
	);

export const getUserBalance = async id => {
	const balance = await smileycoinProcess(SmileyCommand.getBalance, Number, id);
	const address = await smileycoinProcess(
		SmileyCommand.getAccountAddress,
		result => result,
		id
	);

	return {
		balance,
		address
	};
};
