// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

// Example of getting a list of tokens
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();

    try {
        const tokens = await router.supportedTokens("base");
        console.log("Tokens: ", tokens);
        const token = await router.getToken(
            "0x0000000000000000000000000000000000000000",
            "base",
        );
        console.log("Token: ", token);
    } catch (error) {
        console.error(error);
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
