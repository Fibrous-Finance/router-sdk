import type { RouteOptions } from "@fibrous/router-sdk";
import { Router as FibrousRouter } from "@fibrous/router-sdk";


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
