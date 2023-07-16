import { Router as FibrousRouter } from "../router";

// Example of getting a list of tokens
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();

    try {
        const tokens = await router.supportedTokens();
        console.log(tokens);
    } catch (error) {
        console.error(error);
    }
}

main();
