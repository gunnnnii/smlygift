import { smileycoinProcess, SmileyCommand } from "./smileycoin-cli_process";

export enum transactionError {
	fundingError = "fundingError",
	signingError = "signingError"
}

const listUnspent = async (): Promise<any[]> =>
	await smileycoinProcess(SmileyCommand.listUnspent, result =>
		JSON.parse(result)
	);

export const createTransaction = async (
	to: Array<{ address: string; amount: number }>,
	from
) => {
	const unspent = (await listUnspent()).filter(
		({ address }) => address === "BEBNeRJLK9k6zBGJatqtrDgQis6qU2gHsP" //from
	);

	if (!unspent.length) {
		return {
			success: false,
			error: {
				type: transactionError.fundingError,
				message: "No unspent outputs for this address"
			}
		};
	}

	const totalAmount = to.reduce((total, { amount }) => total + amount, 0);

	let overSpend = -(totalAmount + 3);
	const toSpend = unspent.filter(({ amount: amt }) => {
		const filled = overSpend >= 0;
		if (filled) {
			return false;
		} else {
			overSpend += amt;
			return true;
		}
	});

	const transactions = toSpend.map(({ txid, vout }) => ({
		txid,
		vout
	}));

	const accounts = to.reduce(
		(accts, { address, amount }) => ({
			...accts,
			[address.trim()]: amount
		}),
		{}
	);

	if (overSpend > 3) {
		accounts[from] = overSpend - 3;
	}

	const result = await smileycoinProcess(
		SmileyCommand.createRawTransaction,
		result => result,
		JSON.stringify(transactions),
		JSON.stringify(accounts)
	);

	const decoded = await smileycoinProcess(
		SmileyCommand.decodeRawTransaction,
		JSON.parse,
		result.trim()
	);

	return {
		success: true,
		transaction: decoded,
		raw: result.trim()
	};
};

export const sendTransaction = async (
	to: Array<{ address: string; amount: number }>,
	from: string
) => {
	const { raw, transaction, success, error } = await createTransaction(
		to,
		from
	);
	if (!success) {
		return {
			success,
			error
		};
	}

	const { hex, complete } = await smileycoinProcess(
		SmileyCommand.signTransaction,
		JSON.parse,
		raw
	);

	if (complete) {
		await smileycoinProcess(
			SmileyCommand.sendRawTransaction,
			result => result,
			hex
		);
		return {
			success: true,
			txid: transaction.txid
		};
	} else {
		return {
			success: false,
			error: {
				type: transactionError.signingError,
				message: "Signing is incomplete"
			}
		};
	}
};

export const withdrawTransaction = async (
	userId: string,
	address: string,
	return_address: string
) => {
	const balance = await smileycoinProcess(
		SmileyCommand.getBalance,
		Number,
		userId
	);

	const { txid, error, success } = await sendTransaction(
		[
			{
				address: return_address,
				amount: balance
			}
		],
		address
	);

	if (!success) {
		return {
			success,
			error,
			balance
		};
	}

	return {
		success: true,
		txid,
		balance
	};
};
