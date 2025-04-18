import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
async function main() {
    const chainName = "starknet";
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens(chainName);
    const inputToken = await fibrous.getToken(
        "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
        "starknet",
    );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    try {
        const tokenInAddress = inputToken.address;
        const tokenOutAddress = tokens["usdc"].address;
        const tokenInDecimals = Number(inputToken.decimals);
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
