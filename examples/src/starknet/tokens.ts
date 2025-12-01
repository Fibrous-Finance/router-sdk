import { Router as FibrousRouter } from "fibrous-router-sdk";

// Example of getting a list of tokens
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();
    const chainId = router.supportedChains.find(
        (chain) => chain.chain_name == "starknet",
    )?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    const tokens = await router.supportedTokens(chainId);
    console.log(tokens);
}

main();
