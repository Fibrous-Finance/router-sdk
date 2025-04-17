import { BigNumber } from "@ethersproject/bignumber";
// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src/router";
import { ethers, parseUnits } from "ethers";
import { account } from "./account";
import { config } from "dotenv";
config();

// RPC URL for the Base network, you can change this to the RPC URL of your choice
const RPC_URL = process.env.BASE_RPC_URL;
// Destination address for the swap (optional)
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
    const contractwwallet = await fibrous.getContractWAccount(account0, "base");
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Build route options
    const tokens = await fibrous.supportedTokens("base");
    const inputToken = await fibrous.getToken(
        "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
        "base",
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
            console.log(`https://basescan.org/tx/${tx.hash}`);
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
