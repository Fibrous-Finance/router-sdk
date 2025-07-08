// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import { parseUnits } from "ethers";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens("starknet");
    /**
     * recommended that use the token address directly
     * because there may be more than one token with the same symbol.
     */
    const ethToken = tokens.get("eth"); // this search in only the tokens that are verified
    // if you want to search for a token that is not verified, you can use the getToken method
    // const ethToken = await fibrous.getToken(
    //     "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH address
    //     "starknet",
    // );
    const strkToken = tokens.get("strk");
    const usdcToken = tokens.get("usdc");
    const usdtToken = tokens.get("usdt");

    const tokenInAddress_1 = ethToken?.address;
    const tokenInAddress_2 = strkToken?.address;
    const tokenInAddress_3 = usdcToken?.address;

    const tokenOutAddress = usdtToken?.address;

    const tokenInDecimals_1 = ethToken?.decimals;
    const tokenInDecimals_2 = strkToken?.decimals;
    const tokenInDecimals_3 = usdcToken?.decimals;

    if (
        !tokenInAddress_1 ||
        !tokenInAddress_2 ||
        !tokenInAddress_3 ||
        !tokenOutAddress
    ) {
        throw new Error("Token not found");
    }

    if (!tokenInDecimals_1 || !tokenInDecimals_2 || !tokenInDecimals_3) {
        throw new Error("Token not found");
    }

    const inputAmounts = [
        BigInt(parseUnits("0.001", tokenInDecimals_1)), // 0.001 ETH
        BigInt(parseUnits("10", tokenInDecimals_2)), // 10 STRK
        BigInt(parseUnits("5", tokenInDecimals_3)), // 5 USDC
    ];

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
