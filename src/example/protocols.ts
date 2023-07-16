import { Router as FibrousRouter } from "../router";

// Example of getting an object of supported protocols
async function main() {
    // Create a new router instance
    const router = new FibrousRouter();

    try {
        const protocols = await router.supportedProtocols();
        console.log(protocols);
    } catch (error) {
        console.error(error);
    }
}

main();
