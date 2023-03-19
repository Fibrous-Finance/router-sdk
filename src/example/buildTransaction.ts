import { Router } from "../router";
import {  TransactionConfig } from "../types";
import { EXAMPLE_TX_CONFIG, SMART_ORDER_ROUTER_API } from "./constant";

function main(url: string, config: TransactionConfig) {
    // Create a new router instance
    const router = new Router(url);
    // Call the buildTransaction function
    const tx = router.buildTransaction(config);
    console.log("Transaction:",
        tx);
}

main(SMART_ORDER_ROUTER_API, EXAMPLE_TX_CONFIG);