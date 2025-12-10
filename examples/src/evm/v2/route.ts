import { Router as FibrousRouter, getBestRouteParams } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import dotenv from "dotenv";
dotenv.config();
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter(
        {
            apiVersion: "v2", // optional v2 is the latest version
        }
    );
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    // Build route options
    const tokens = await fibrous.supportedTokens(chainId);
    // const inputToken = await fibrous.getToken(
    //     "0x0000000000000000000000000000000000000000",
    //     chainId,
    // );
    const inputToken = tokens.get("usdc");
    try {
        if (!inputToken) {
            throw new Error("Input token not found");
        }
        const tokenInAddress = inputToken.address;
        const outputToken = await fibrous.getToken(
            "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb",
            chainId,
        );
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
        const inputAmount = BigInt(parseUnits("4", tokenInDecimals)); // 4 usdc
        const reverse = false;
        

        const getBestRouteParams: getBestRouteParams = {
            amount: inputAmount,
            tokenInAddress: tokenInAddress,
            tokenOutAddress: tokenOutAddress,
            chainId: chainId,
            options: {
                reverse,
            },
        };
        // Converting 4 usdc to usdt0
        const route = await fibrous.getBestRoute(
            getBestRouteParams,
        );
        console.log("route", route);
    } catch (error) {
        console.error(error);
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
