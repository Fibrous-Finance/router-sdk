import type { RouteOptions } from "@fibrous/router-sdk";
import { Router as FibrousRouter } from "@fibrous/router-sdk";

import { randomBytes } from "node:crypto";
const randomStarknetAddress = () => `0x${randomBytes(32).toString("hex")}`;

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens();
    const opts: RouteOptions = {
        amount: 1,
        tokenInAddress: tokens["eth"].address,
        tokenOutAddress: tokens["usdc"].address,
    };

    // Get a route using the getBestRoute method
    const bestRoute = await fibrous.getBestRoute(opts);
    if (bestRoute.success === false) {
        console.error(bestRoute.errorMessage);
        return;
    }

    // Call the buildTransaction method in order to build the transaction
    const slippage = 0.5;
    const receiverAddress = randomStarknetAddress();
    const tx = fibrous.buildTransaction({
        route: bestRoute,
        slippage,
        accountAddress: receiverAddress,
    });
    console.log("Transaction:", tx);
}

main();
