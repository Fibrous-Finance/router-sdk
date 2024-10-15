import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
async function main() {
    const chainName = "starknet";
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens(chainName);
    try {
        const tokenInAddress = tokens["eth"].address;
        const tokenOutAddress = tokens["usdc"].address;
        const tokenInDecimals = tokens["eth"].decimals;
        const inputAmount = BigNumber.from(
            1n * 10n ** BigInt(tokenInDecimals - 1),
        ); // 0.1 ETH
        const reverse = false;
        // Converting 1 ETH to USDC
        const route = await fibrous.getBestRoute(
            inputAmount,
            tokenInAddress,
            tokenOutAddress,
            chainName,
            {
                reverse,
            },
        );
        console.log("route", route);
    } catch (error) {
        console.error(error);
    }
}

main();
