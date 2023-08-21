import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

import { randomBytes } from "node:crypto";
const randomStarknetAddress = () => `0x${randomBytes(32).toString("hex")}`;

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens();

    const tokenInAddress = tokens["eth"].address;
    const tokenOutAddress = tokens["usdc"].address;
    const tokenInDecimals = tokens["eth"].decimals;
    const inputAmount = parseUnits("1", tokenInDecimals);
    // Get a route using the getBestRoute method
    const bestRoute = await fibrous.getBestRoute(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
    );
    if (bestRoute.success === false) {
        console.error(bestRoute.errorMessage);
        return;
    }

    // Call the buildTransaction method in order to build the transaction
    const slippage = 0.5;
    const receiverAddress = randomStarknetAddress();
    const tx = fibrous.buildTransaction(bestRoute, slippage, receiverAddress);
    console.log("Transaction:", tx);
}

main();
