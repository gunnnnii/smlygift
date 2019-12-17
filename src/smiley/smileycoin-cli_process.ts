import { spawn } from "child_process";

export enum SmileyCommand {
	validateAddress = "validateaddress",
	createAddress = "getnewaddress",
	getBalance = "getbalance",
	createRawTransaction = "createrawtransaction",
	listUnspent = "listunspent",
	decodeRawTransaction = "decoderawtransaction",
	signTransaction = "signrawtransaction",
	sendRawTransaction = "sendrawtransaction",
	setAccount = "setaccount",
	getAccountAddress = "getaccountaddress"
}

export const smileycoinProcess = (
	command: SmileyCommand,
	cb: Function = result => result,
	...args: string[]
): Promise<any> =>
	new Promise((resolve, reject) => {
		const process = spawn("smileycoin-cli", [command, ...args]);
		let stream = "";
		let cmdError = "";
		process.stdout.setEncoding("utf8");
		process.stderr.setEncoding("utf8");
		process.stdout.on("data", chunk => {
			stream += chunk;
		});

		process.stderr.on("error", chunk => {
			cmdError += chunk;
		});

		let result;
		process.stdout.on("end", () => {
			try {
				if (cmdError) result = cb(cmdError);
				else result = cb(stream);
			} catch (e) {
				console.error("stream: ", stream, "error: ", cmdError, args, cb);
			}
		});

		process.on("close", code => {
			if (!cmdError) resolve(result);
			else {
				console.error(result);
				reject(result);
			}
		});
		process.on("error", error => reject(error));
	});
