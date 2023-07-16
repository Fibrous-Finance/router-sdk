import { Router as FibrousRouter } from "../router";
import { RouteOptions } from "../types";

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

    try {
        const route = await fibrous.getBestRoute(opts);
        console.log(route);
    } catch (error) {
        console.error(error);
    }
}

main();
