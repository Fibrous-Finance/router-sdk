import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Account, CairoVersion, Call, RpcProvider } from "starknet";

import { account } from "./account";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens("starknet");
    /**
     * recommended that use the token address directly
     * because there may be more than one token with the same symbol.
     */
    const tokenInAddress_1 = tokens.get("eth")?.address;
    const tokenInAddress_2 = tokens.get("strk")?.address;
    const tokenInAddress_3 = tokens.get("usdc")?.address;

    const tokenOutAddress = tokens.get("usdt")?.address;

    const tokenInDecimals_1 = tokens.get("eth")?.decimals;
    const tokenInDecimals_2 = tokens.get("strk")?.decimals;
    const tokenInDecimals_3 = tokens.get("usdc")?.decimals;
    if (
        !tokenInAddress_1 ||
        !tokenInAddress_2 ||
        !tokenInAddress_3 ||
        !tokenOutAddress ||
        !tokenInDecimals_1 ||
        !tokenInDecimals_2 ||
        !tokenInDecimals_3
    ) {
        throw new Error("Token not found");
    }
    const inputAmounts = [
        BigNumber.from(1n * 10n ** BigInt(tokenInDecimals_1 - 3)), // 0.001 ETH
        BigNumber.from(10n * 10n ** BigInt(tokenInDecimals_2)), // 0.001 STRK
        BigNumber.from(5n * 10n ** BigInt(tokenInDecimals_3)), // 5 USDC
    ]; // 0.001 ETH

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1; // 1%
    const destination = "destination_address"; // The address to receive the tokens after the swap is completed (required)
    const tokenInAddresses = [
        tokenInAddress_1,
        tokenInAddress_2,
        tokenInAddress_3,
    ];
    const tokenOutAddresses = [tokenOutAddress];
    const swapCalls = await fibrous.buildBatchTransaction(
        inputAmounts,
        tokenInAddresses,
        tokenOutAddresses,
        slippage,
        destination,
        "starknet",
    );
    const publicKey = "public_key";
    const privateKey = "private_key";

    // https://www.starknetjs.com/docs/guides/connect_account
    // If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter
    const rpcUrl = "rpc_url";

    const account0 = account(privateKey, publicKey, "1", rpcUrl);
    const approveCalls: Call[] = [];
    for (let i = 0; i < inputAmounts.length; i++) {
        const approveCall: Call = await fibrous.buildApproveStarknet(
            inputAmounts[i],
            tokenInAddresses[i],
        );
        approveCalls.push(approveCall);
    }
    const resp = await account0.execute([...approveCalls, ...swapCalls]);
    console.log(`https://starkscan.co/tx/${resp.transaction_hash}`);
}

main();
