import { Router as FibrousRouter } from "fibrous-router-sdk";

// Example of getting an object of supported protocols
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "base")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    try {
        const protocols = await fibrous.supportedProtocols(chainId);
        console.log(protocols);
    } catch (error) {
        console.error(error);
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
