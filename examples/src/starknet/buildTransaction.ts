import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Call } from "starknet";

import { account } from "./account";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    const PUBLIC_KEY = process.env.STARKNET_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;
    const RPC_URL = process.env.STARKNET_RPC_URL;
    const DESTINATION = process.env.STARKNET_PUBLIC_KEY; // The address to receive the tokens after the swap is completed (required)
    if (!DESTINATION || !PRIVATE_KEY || !RPC_URL || !PUBLIC_KEY) {
        throw new Error("Missing environment variables");
    }


    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens("starknet");
    /**
     * recommended that use the token address directly 
     * because there may be more than one token with the same symbol.
     */
    const tokenInAddress = tokens.get("eth")?.address;
    const tokenOutAddress = tokens.get("usdt")?.address;
    const tokenInDecimals = tokens.get("eth")?.decimals;
    if (!tokenInAddress || !tokenOutAddress || !tokenInDecimals) {
        throw new Error("Token not found");
    }
    const inputAmount = BigNumber.from(1n * 10n ** BigInt(tokenInDecimals - 3)); // 0.001 ETH

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1; // 1%
    const swapCall = await fibrous.buildTransaction(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        slippage,
        DESTINATION,
        "starknet",
    );


    // https://www.starknetjs.com/docs/guides/connect_account
    // If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter
    const account0 = account(PRIVATE_KEY, PUBLIC_KEY, "1", RPC_URL);
    const approveCall: Call = await fibrous.buildApproveStarknet(
        inputAmount,
        tokenInAddress,
    );
    const resp = await account0.execute([approveCall, swapCall]);
    console.log(`https://starkscan.co/tx/${resp.transaction_hash}`);
}

main();
