import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens();
    try {
        const tokenInAddress = tokens["eth"].address;
        const tokenOutAddress = tokens["usdc"].address;
        const tokenInDecimals = tokens["eth"].decimals;
        const inputAmount = parseUnits("1", tokenInDecimals);
        // Converting 1 ETH to USDC
        const route = await fibrous.getBestRoute(
            inputAmount,
            tokenInAddress,
            tokenOutAddress,
        );
        console.log(route);
    } catch (error) {
        console.error(error);
    }
}

main();
