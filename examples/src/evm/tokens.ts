// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

// Example of getting a list of tokens
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();
    const chainId = router.supportedChains.find(chain => chain.chain_name == "base")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    try {
        const tokens = await router.supportedTokens(chainId);
        console.log("Tokens: ", tokens);
        const token = await router.getToken(
            "0x0000000000000000000000000000000000000000",
            chainId,
        );
        console.log("Token: ", token);
    } catch (error) {
        console.error(error);
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
