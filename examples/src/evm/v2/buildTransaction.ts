import { Router as FibrousRouter } from "../../../../src";
import { ethers, parseUnits } from "ethers";
import { account } from "../account";
import { humanReadableEvmSwapCallDataLog } from "../../utils/humanReadableEvmLog";
import dotenv from "dotenv";
import { monitorTransaction } from "../utils";
import { buildTransactionParams } from "../../../../src/types/router";

dotenv.config();
// RPC URL for the EVM network, you can change this to the RPC URL of your choice
const RPC_URL = process.env.HYPER_EVM_RPC_URL;
// Destination address for the swap (optional)
const destination = process.env.EVM_PUBLIC_KEY;
// Private key of the account that will be used to sign the transaction
const privateKey = process.env.EVM_PRIVATE_KEY;

async function main() {
    const apiKey = process.env.FIBROUS_API_KEY;
    const fibrous = new FibrousRouter({
        apiKey,
        apiVersion: "v2",
    });
    if (!privateKey || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    // Create a new contract instance
    const account0 = account(privateKey, RPC_URL);
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }

    const contractWallet = await fibrous.getContractWAccount(
        account0 as any,
        chainId,
    );
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    // Build route options
    const tokens = await fibrous.supportedTokens(chainId);
    // const inputToken = await fibrous.getToken(
    //         "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb",
    //     chainId,
    // );
    const inputToken = tokens.get("hype");
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("khype");
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
    const inputAmount = BigInt(parseUnits("10", tokenInDecimals)); // 5 Hype
    const isNativeToken =
        tokenInAddress == "0x0000000000000000000000000000000000000000";
    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1;
    const buildTransactionParams: buildTransactionParams = {
        inputAmount: inputAmount,
        tokenInAddress: tokenInAddress,
        tokenOutAddress: tokenOutAddress,
        slippage: slippage,
        destination: destination || account0.address,
        chainId: chainId,
    };
    const { route, calldata } = await fibrous.buildTransaction(buildTransactionParams);

    const approveResponse = await fibrous.buildApproveEVM(
        inputAmount,
        tokenInAddress,
        account0 as any,
        chainId,
    );
    humanReadableEvmSwapCallDataLog(
        calldata,
        inputToken,
        outputToken,
        await fibrous.supportedProtocols(chainId),
    );
    if (approveResponse === true) {
        try {
            // Type guard: EVM chains return EvmTransactionData
            if ("route" in calldata && "swap_parameters" in calldata) {
                const feeData = await provider.getFeeData();
                if (!feeData.gasPrice) {
                    console.log("gasPrice not found");
                    return;
                }
                let tx;
                if (isNativeToken) {
                    tx = await contractWallet.swap(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            value: inputAmount,
                            gasPrice: feeData.gasPrice * 4n,
                        },
                    );
                } else {
                    tx = await contractWallet.swap(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            gasPrice: feeData.gasPrice * 2n,
                        },
                    );
                }
                await monitorTransaction(tx);
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
