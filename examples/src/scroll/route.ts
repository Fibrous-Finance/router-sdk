// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

import { parseUnits } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens("scroll");
    try {
        /**
         * recommended that use the token address directly 
         * because there may be more than one token with the same symbol.
         */
        const tokenInAddress = tokens["usdt"].address;
        const tokenOutAddress = tokens["usdc"].address;
        const tokenInDecimals = Number(tokens["usdt"].decimals);
        const inputAmount = BigNumber.from(parseUnits("5", tokenInDecimals));
        const reverse = false;
        // Converting 5 USDT to USDC
        const route = await fibrous.getBestRoute(
            inputAmount,
            tokenInAddress,
            tokenOutAddress,
            "scroll",
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
