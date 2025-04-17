import { Router as FibrousRouter } from "fibrous-router-sdk";

import { parseUnits } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens("base");
    const usdtToken = await fibrous.getToken(
        "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
        "base",
    );
    try {
        if (!usdtToken) {
            throw new Error("Token not found");
        }
        const tokenInAddress = usdtToken.address;
        const tokenOutAddress = tokens["usdc"].address;
        const tokenInDecimals = Number(usdtToken.decimals);
        const inputAmount = BigNumber.from(parseUnits("5", tokenInDecimals));
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
