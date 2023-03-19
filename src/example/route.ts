import { Router } from "../router";
import { RouteConfig } from "../types";
import {SMART_ORDER_ROUTER_API} from "./constant";

function main(url: string, config: RouteConfig) {
    // Create a new router instance
    const router = new Router(url);
    // Call the route function
    router.route(
        config
    ).then(console.log).catch(console.error);

}


const routeConfig: RouteConfig = {
    amount: 1,
    tokenInAddress: "0x06ff32e182d05b307f22f1093b5f3496cdf56f233a7f781c5ec4cd992f963225",
    tokenOutAddress: "0x05aae0e88a8349bae9742a41df902080585fd0cee2f097cde8afc97967e5f8d6",
    reverse: false,
    direct: true
}
main(SMART_ORDER_ROUTER_API, routeConfig);
