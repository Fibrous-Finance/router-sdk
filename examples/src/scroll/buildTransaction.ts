import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";

import { ethers, parseUnits } from "ethers";
import { account } from "./account";
import { config } from "dotenv";
config();
// RPC URL for the Scroll network, you can change this to the RPC URL of your choice
const RPC_URL = process.env.SCROLL_RPC_URL;
// Destination address for the swap (required)
const destination = process.env.EVM_PUBLIC_KEY;
// Private key of the account that will be used to sign the transaction
const privateKey = process.env.EVM_PRIVATE_KEY;

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    if (!privateKey || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    // Create a new contract instance
    const account0 = account(privateKey, RPC_URL);
    const contractwwallet = await fibrous.getContractWAccount(
        account0,
        "scroll",
    );
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Build route options
    const tokens = await fibrous.supportedTokens("scroll");
    const inputToken = await fibrous.getToken(
        "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
        "scroll",
    );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const tokenInAddress = inputToken.address;
    const tokenOutAddress = tokens["usdc"].address;
    const tokenInDecimals = Number(inputToken.decimals);
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
            const feeData = await provider.getFeeData();
            if (!feeData.gasPrice) {
                console.log("gasPrice not found");
                return;
            }
            const tx = await contractwwallet.swap(
                swapCall.route,
                swapCall.swap_parameters,
                {
                    gasPrice: feeData.gasPrice * 2n,
                }
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
