// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";

// Example of getting an object of supported protocols
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();

    try {
        const protocols = await router.supportedProtocols("starknet");
        console.log(protocols);
    } catch (error) {
        console.error(error);
    }
}

main();
