// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

// Example of getting a list of tokens
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();

    try {
        const tokens = await router.supportedTokens("starknet");
        console.log(tokens);
    } catch (error) {
        console.error(error);
    }
}

main();
