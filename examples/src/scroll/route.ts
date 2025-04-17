import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens("scroll");
    try {
        const inputToken = await fibrous.getToken(
            "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
            "scroll",
        );
        if (!inputToken) {
            throw new Error("Input token not found");
        }
        const tokenInAddress = inputToken.address;
        const tokenOutAddress = tokens["usdc"].address;
        const tokenInDecimals = Number(inputToken.decimals);
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
