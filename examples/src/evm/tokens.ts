// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

// Example of getting a list of tokens
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "base")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    try {
        const tokens = await fibrous.supportedTokens(chainId);
        console.log("Tokens: ", tokens);
        const token = await fibrous.getToken(
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
