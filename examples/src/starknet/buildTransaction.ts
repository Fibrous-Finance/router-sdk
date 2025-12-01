    import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Call } from "starknet";
import { parseUnits } from "ethers";

import "dotenv/config";

import { account } from "./account";
import { humanReadableStarknetSwapCallDataLog } from "../utils/humanReadableStarknetLog";

const PUBLIC_KEY = process.env.STARKNET_PUBLIC_KEY;
const PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;
const RPC_URL = process.env.STARKNET_RPC_URL;
const DESTINATION = process.env.STARKNET_PUBLIC_KEY; // The address to receive the tokens after the swap is completed (required)

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "starknet")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    if (!DESTINATION || !PRIVATE_KEY || !RPC_URL || !PUBLIC_KEY) {
        throw new Error("Missing environment variables");
    }

    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens(chainId);
    /**
     * recommended that use the token address directly
     * because there may be more than one token with the same symbol.
     */
    const inputToken = await fibrous.getToken(
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH address
        chainId,
    );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const outputToken = tokens.get("strk"); // this search in only the tokens that are verified
    // if you want to search for a token that is not verified, you can use the getToken method
    // const outputToken = await fibrous.getToken(
    //     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK address
    //     "starknet",
    // );
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    const tokenInAddress = inputToken.address;
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken?.decimals);
    if (!tokenInAddress || !tokenOutAddress || !tokenInDecimals) {
        throw new Error("Token not found");
    }
    const inputAmount = BigInt(parseUnits("0.0001", tokenInDecimals)); // 0.0001 ETH

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 0.1; // 1%
    const { route, calldata } = await fibrous.buildRouteAndCalldata(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        slippage,
        DESTINATION,
        chainId,
        {
            reverse: false,
            direct: false,
            excludeProtocols: [],
        },
    );
    // https://www.starknetjs.com/docs/guides/connect_account
    // If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter

    const account0 = account(PRIVATE_KEY, PUBLIC_KEY, "1", RPC_URL);
    const approveCall: Call = await fibrous.buildApproveStarknet(
        inputAmount,
        tokenInAddress,
    );
    humanReadableStarknetSwapCallDataLog(
        calldata,
        inputToken,
        outputToken,
        await fibrous.supportedProtocols(chainId),
    );

    // Type guard: Starknet chains return Call
    if ("contractAddress" in calldata && "entrypoint" in calldata) {
        const resp = await account0.execute([approveCall, calldata], {
            version: 3,
        });
        console.log(`https://voyager.online/tx/${resp.transaction_hash}`);
    } else {
        console.error("Invalid swap call data for Starknet transaction");
    }
}

main();
