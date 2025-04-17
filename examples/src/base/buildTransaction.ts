import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";

import { parseUnits } from "ethers";
import { account } from "./account";

// RPC URL for the Base network, you can change this to the RPC URL of your choice
const RPC_URL = "https://mainnet.base.org";
// Destination address for the swap (optional)
const destination = "";
// Private key of the account that will be used to sign the transaction
const privateKey = "<PRIVATE_KEY>";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Create a new contract instance
    const account0 = account(privateKey, RPC_URL);
    const contractwwallet = await fibrous.getContractWAccount(account0, "base");

    // Build route options
    const tokens = await fibrous.supportedTokens("base");
    const ethToken = await fibrous.getToken(
        "0x0000000000000000000000000000000000000000",
        "base",
    );

    const tokenInAddress = tokens["usdc"].address;
    const tokenOutAddress = ethToken.address;
    const tokenInDecimals = Number(tokens["usdc"].decimals);
    const inputAmount = BigNumber.from(parseUnits("5", tokenInDecimals));

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1;
    const swapCall = await fibrous.buildTransaction(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        slippage,
        destination || account0.address,
        "base",
    );

    const approveResponse = await fibrous.buildApproveEVM(
        inputAmount,
        tokenInAddress,
        account0,
        "base",
    );

    if (approveResponse === true) {
        try {
            const tx = await contractwwallet.swap(
                swapCall.route,
                swapCall.swap_parameters,
            );
            await tx.wait();
            console.log(`https://basescan.com/tx/${tx.hash}`);
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
