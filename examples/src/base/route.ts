// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import { parseUnits } from "ethers";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens("base");
    const inputToken = await fibrous.getToken(
        "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
        "base",
    );
    try {
        if (!inputToken) {
            throw new Error("Input token not found");
        }
        const tokenInAddress = inputToken.address;
        const usdcToken = tokens.get("usdc");
        if (!usdcToken) {
            throw new Error("USDC token not found");
        }
        const tokenOutAddress = usdcToken.address;
        const tokenInDecimals = Number(inputToken.decimals);
        const inputAmount = BigInt(parseUnits("5", tokenInDecimals));
        const reverse = false;
        // Converting 5 USDT to USDC
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
