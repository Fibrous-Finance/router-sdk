// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import { parseUnits } from "ethers";
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
        const outputToken = tokens.get("usdc");
        // if you want to search for a token that is not verified, you can use the getToken method
        // const outputToken = await fibrous.getToken(
        //     "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4", // USDC address
        //     "scroll",
        // );
        if (!outputToken) {
            throw new Error("Output token not found");
        }
        const tokenOutAddress = outputToken.address;
        const tokenInDecimals = Number(inputToken.decimals);
        const inputAmount = BigInt(parseUnits("5", tokenInDecimals)); // 5 USDT
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
