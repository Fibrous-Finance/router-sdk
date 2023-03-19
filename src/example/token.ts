import { Router } from "../router";
import {SMART_ORDER_ROUTER_API} from "./constant";

// Example of getting a list of tokens
function main(url: string) {
    // Create a new router instance
    const router = new Router(url);
    // Call the tokenList function
    router.tokenList().then(console.log).catch(console.error);
}


main(SMART_ORDER_ROUTER_API);