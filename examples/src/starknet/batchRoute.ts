import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens("starknet");
    /**
     * recommended that use the token address directly 
     * because there may be more than one token with the same symbol.
     */
    const tokenInAddress_1 = tokens.get("eth")?.address;
    const tokenInAddress_2 = tokens.get("strk")?.address;
    const tokenInAddress_3 = tokens.get("usdc")?.address;

    const tokenOutAddress = tokens.get("usdt")?.address;

    const tokenInDecimals_1 = tokens.get("eth")?.decimals;
    const tokenInDecimals_2 = tokens.get("strk")?.decimals;
    const tokenInDecimals_3 = tokens.get("usdc")?.decimals;

    if (!tokenInAddress_1 || !tokenInAddress_2 || !tokenInAddress_3 || !tokenOutAddress) {  
        throw new Error("Token not found");
    }

    if (!tokenInDecimals_1 || !tokenInDecimals_2 || !tokenInDecimals_3) {   
        throw new Error("Token not found");
    }

    const inputAmounts = [
        BigNumber.from(1n * 10n ** BigInt(tokenInDecimals_1 - 3)), // 0.001 ETH
        BigNumber.from(10n * 10n ** BigInt(tokenInDecimals_2)), // 0.001 STRK
        BigNumber.from(5n * 10n ** BigInt(tokenInDecimals_3)), // 5 USDC
    ]; // 0.001 ETH

    const tokenInAddresses = [
        tokenInAddress_1,
        tokenInAddress_2,
        tokenInAddress_3,
    ];
    const tokenOutAddresses = [tokenOutAddress];
    const swapCalls = await fibrous.getBestRouteBatch(
        inputAmounts,
        tokenInAddresses,
        tokenOutAddresses,
        "starknet",
    );

    console.log(swapCalls);
}

main();
