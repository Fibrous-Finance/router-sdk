import { Router as FibrousRouter } from "../../../../src";
import { Call } from "starknet";
import { parseUnits } from "ethers";

import dotenv from "dotenv";
import { account } from "../account";
import { humanReadableStarknetSwapCallDataLog } from "../../utils/humanReadableStarknetLog";
import { buildRouteAndCalldataParams } from "../../../../src/types/router";

dotenv.config();
const PUBLIC_KEY = process.env.STARKNET_PUBLIC_KEY;
const PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;
const RPC_URL = process.env.STARKNET_RPC_URL;

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "starknet")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    if (!PRIVATE_KEY || !RPC_URL || !PUBLIC_KEY) {
        throw new Error("Missing environment variables");
    }

    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens(chainId);
    /**
     * recommended that use the token address directly
     * because there may be more than one token with the same symbol.
     */
    const inputToken = tokens.get("usdc"); // this search in only the tokens that are verified

    // const inputToken = await fibrous.getToken(
    //     "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb", // USDC address
    //     chainId,
    // );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const outputToken = tokens.get("usdt"); // this search in only the tokens that are verified
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
    const inputAmount = BigInt(parseUnits("1", tokenInDecimals)); // 1 USDC

    // Call the buildTransaction method in order to build the transaction
    // slippage: The maximum acceptable slippage of the buyAmount amount.
    const slippage = 0.1; // 1%
    const DESTINATION = process.env.STARKNET_PUBLIC_KEY; // The address to receive the tokens after the swap is completed (required)

    const buildRouteAndCalldataParams: buildRouteAndCalldataParams = {
        inputAmount: inputAmount,
        tokenInAddress: tokenInAddress,
        tokenOutAddress: tokenOutAddress,
        slippage: slippage,
        destination: DESTINATION,
        chainId: chainId,
        options: {
            reverse: false,
            direct: false,
            excludeProtocols: [],
        },
    };
    const { route, calldata } = await fibrous.buildRouteAndCalldata(
        buildRouteAndCalldataParams,
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
