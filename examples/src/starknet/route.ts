// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import { parseUnits } from "ethers";
async function main() {
    const chainName = "starknet";
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens(chainName);
    const inputToken = await fibrous.getToken(
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH address
        "starknet",
    );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    try {
        const tokenInAddress = inputToken.address;
        const outputToken = tokens.get("strk"); // this search in only the tokens that are verified
        // if you want to search for a token that is not verified, you can use the getToken method
        // const outputToken = await fibrous.getToken(
        //     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK address
        //     "starknet",
        // );
        if (!outputToken) {
            throw new Error("Output token not found");
        }
        const tokenOutAddress = outputToken.address;
        const tokenInDecimals = Number(inputToken.decimals);
        const inputAmount = BigInt(parseUnits("0.01", tokenInDecimals)); // 0.01 ETH
        const reverse = false;
        // Converting 1 ETH to STRK
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
