// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import { ethers, parseUnits } from "ethers";
import "dotenv/config";
import { account } from "./account";

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
        "0x0000000000000000000000000000000000000000",
        "base",
    );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("usdc");
    // if you want to search for a token that is not verified, you can use the getToken method
    // const outputToken = await fibrous.getToken(
    //     "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC address
    //     "base",
    // );
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken.decimals);
    const inputAmount = BigInt(parseUnits("0.01", tokenInDecimals)); // 0.01 ETH

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
            // Type guard: EVM chains return EvmTransactionData
            if ("route" in swapCall && "swap_parameters" in swapCall) {
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
                    },
                );
                await tx.wait();
                console.log(`https://basescan.org/tx/${tx.hash}`);
            } else {
                console.error("Invalid swap call data for EVM transaction");
            }
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
