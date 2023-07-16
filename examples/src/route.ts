import { Router as FibrousRouter } from "fibrous-router-sdk";

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();

    // Build route options
    const tokens = await fibrous.supportedTokens();
    try {
        // Converting 1 ETH to USDC
        const route = await fibrous.getBestRoute(
            1.2,
            tokens["eth"].address,
            tokens["usdc"].address,
        );
        console.log(route);
    } catch (error) {
        console.error(error);
    }
}

main();
