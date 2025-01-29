import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";

import { parseUnits } from "ethers";
import { account } from "./account";

// RPC URL for the Scroll network, you can change this to the RPC URL of your choice
const rpcUrl = "https://rpc.scroll.io";
// Destination address for the swap (required)
const destination = "<DESTINATION_ADDRESS>";
// Private key of the account that will be used to sign the transaction
const privateKey = "<PRIVATE_KEY>";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Create a new contract instance
    const account0 = account(privateKey, rpcUrl);
    const contractwwallet = await fibrous.getContractWAccount(
        account0,
        "scroll",
    );

    // Build route options
    const tokens = await fibrous.supportedTokens("scroll");
    /**
     * recommended that use the token address directly
     * because there may be more than one token with the same symbol.
     */
    const tokenInAddress = tokens["usdt"].address;
    const tokenOutAddress = tokens["usdc"].address;
    const tokenInDecimals = Number(tokens["usdt"].decimals);
    const inputAmount = BigNumber.from(parseUnits("5", tokenInDecimals));

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1;
    const swapCall = await fibrous.buildTransaction(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        slippage,
        destination,
        "scroll",
    );

    const approveResponse = await fibrous.buildApproveEVM(
        inputAmount,
        tokenInAddress,
        account0,
        "scroll",
    );

    if (approveResponse === true) {
        try {
            const tx = await contractwwallet.swap(
                swapCall.route,
                swapCall.swap_parameters,
            );
            await tx.wait();
            console.log(`https://scrollscan.com/tx/${tx.hash}`);
        } catch (e) {
            console.error("Error swapping tokens: ", e);
        }
    } else {
        console.error("Error approving tokens");
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
