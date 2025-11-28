// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

// Example of getting an object of supported protocols
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();
    const chainId = router.supportedChains.find(
        (chain) => chain.chain_name == "starknet",
    )?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }

    const protocols = await router.supportedProtocols(chainId);
    console.log(protocols);
}

main();
