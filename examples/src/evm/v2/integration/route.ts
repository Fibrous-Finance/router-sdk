import { Router as FibrousRouter, IntegrationData,getBestRouteParams } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import dotenv from "dotenv";
dotenv.config();
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter(
        {
            apiKey: process.env.FIBROUS_API_KEY, // your api key optional
            apiVersion: "v2", // optional v2 is the latest version
        }
    );
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "monad")?.chain_id;
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
            "0x3bd359c1119da7da1d913d1c4d2b7c461115433a",
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
        const inputAmount = BigInt(parseUnits("1", tokenInDecimals)); // 1 Hype
        const reverse = false;
        
        const integrationData: IntegrationData = { // optional integration data for the route builder
            integratorAddress: process.env.INTEGRATOR_ADDRESS!,
            integratorFeePercentageBps: Number(process.env.INTEGRATOR_FEE_PERCENTAGE_BPS!),
            integratorSurplusPercentageBps: Number(process.env.INTEGRATOR_SURPLUS_PERCENTAGE_BPS!),
        };
        const getBestRouteParams: getBestRouteParams = {
            amount: inputAmount,
            tokenInAddress: tokenInAddress,
            tokenOutAddress: tokenOutAddress,
            chainId: chainId,
            integrationData: integrationData,
            options: {
                reverse,
            },
        };
        // Converting 1 Hype to usdt0
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
