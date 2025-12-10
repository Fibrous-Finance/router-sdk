import { Router as FibrousRouter, buildBatchTransactionParams } from "fibrous-router-sdk";
import { Call } from "starknet";
import { parseUnits } from "ethers";

import { account } from "../account";
import dotenv from "dotenv";
dotenv.config();    
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "starknet")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens(chainId);

    const ethToken = tokens.get("eth");
    const strkToken = tokens.get("strk");
    const usdcToken = tokens.get("usdc");
    const usdtToken = tokens.get("usdt");

    if (!ethToken || !strkToken || !usdcToken || !usdtToken) {
        throw new Error("Required tokens not found");
    }

    const tokenInAddress_1 = ethToken.address;
    const tokenInAddress_2 = strkToken.address;
    const tokenInAddress_3 = usdcToken.address;

    const tokenOutAddress = usdtToken.address;

    const tokenInDecimals_1 = ethToken.decimals;
    const tokenInDecimals_2 = strkToken.decimals;
    const tokenInDecimals_3 = usdcToken.decimals;

    const inputAmounts = [
        BigInt(parseUnits("0.0001", Number(tokenInDecimals_1))), // 0.001 ETH
        BigInt(parseUnits("1", Number(tokenInDecimals_2))), // 10 STRK
        BigInt(parseUnits("5", Number(tokenInDecimals_3))), // 5 USDC
    ];
    const public_key = process.env.STARKNET_PUBLIC_KEY;
    const privateKey = process.env.STARKNET_PRIVATE_KEY;
    const RPC_URL = process.env.STARKNET_RPC_URL;
    const destination = process.env.STARKNET_PUBLIC_KEY; // The address to receive the tokens after the swap is completed (required)
    if (!privateKey || !public_key || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 1; // 1%
    const tokenInAddresses = [
        tokenInAddress_1,
        tokenInAddress_2,
        tokenInAddress_3,
    ];
    const tokenOutAddresses = [tokenOutAddress];

    const buildBatchTransactionParams: buildBatchTransactionParams = {
        inputAmounts: inputAmounts,
        tokenInAddresses: tokenInAddresses,
        tokenOutAddresses: tokenOutAddresses,
        slippage: slippage,
        destination: destination,
        chainId: chainId,
        options: { reverse: false, direct: false, excludeProtocols: [] },
    };
    const swapCalls = await fibrous.buildBatchTransaction(buildBatchTransactionParams);

    // https://www.starknetjs.com/docs/guides/connect_account
    // If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter

    const account0 = account(privateKey, public_key, "1", RPC_URL);
    const approveCalls: Call[] = [];
    for (let i = 0; i < inputAmounts.length; i++) {
        const approveCall: Call = await fibrous.buildApproveStarknet(
            inputAmounts[i],
            tokenInAddresses[i],
        );
        approveCalls.push(approveCall);
    }
    // Type guard: Starknet chains return Call[]
    if (
        Array.isArray(swapCalls) &&
        swapCalls.every(
            (call) => "contractAddress" in call && "entrypoint" in call,
        )
    ) {
        const resp = await account0.execute([...approveCalls, ...swapCalls]);
        console.log(`https://voyager.online/tx/${resp.transaction_hash}`);
    } else {
        console.error("Invalid swap call data for Starknet batch transaction");
    }
}

main();
