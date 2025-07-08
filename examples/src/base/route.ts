// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import { parseUnits } from "ethers";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens("base");
    const inputToken = await fibrous.getToken(
        "0x0000000000000000000000000000000000000000",
        "base",
    );
    try {
        if (!inputToken) {
            throw new Error("Input token not found");
        }
        const tokenInAddress = inputToken.address;
        const outputToken = tokens.get("usdc");
        if (!outputToken) {
            throw new Error("Output token not found");
        }
        const tokenOutAddress = outputToken.address;
        // if you want to search for a token that is not verified, you can use the getToken method
        // const outputToken = await fibrous.getToken(
        //     "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC address
        //     "base",
        // );
        const tokenInDecimals = Number(inputToken.decimals);
        const inputAmount = BigInt(parseUnits("0.01", tokenInDecimals)); // 0.01 ETH
        const reverse = false;
        // Converting 0.01 ETH to USDC
        const route = await fibrous.getBestRoute(
            inputAmount,
            tokenInAddress,
            tokenOutAddress,
            "base",
            {
                reverse,
            },
        );
        console.log("route", route);
    } catch (error) {
        console.error(error);
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
