import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Account, CairoVersion, Call, RpcProvider } from "starknet";

import { account } from "./account";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens("starknet");

    const tokenInAddress = tokens["eth"].address;
    const tokenOutAddress = tokens["usdt"].address;
    const tokenInDecimals = tokens["eth"].decimals;
    const inputAmount = BigNumber.from(1n * 10n ** BigInt(tokenInDecimals - 3)); // 0.001 ETH

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1; // 1%
    const destination = "destination_address"; // The address to receive the tokens after the swap is completed (required)
    const swapCall = await fibrous.buildTransaction(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        slippage,
        destination,
        "starknet",
    );
    const public_key = "public_key";
    const privateKey = "private_key";

    // https://www.starknetjs.com/docs/guides/connect_account
    // If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter
    const RPC_URL = "rpc_url";

    const account0 = account(privateKey, public_key, "1", RPC_URL);
    const approveCall: Call = await fibrous.buildApproveStarknet(
        inputAmount,
        tokenInAddress,
    );
    const resp = await account0.execute([approveCall, swapCall]);
    console.log(`https://starkscan.co/tx/${resp.transaction_hash}`);
}

main();
