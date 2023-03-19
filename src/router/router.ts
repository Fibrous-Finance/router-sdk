import { routeRequest, formatRouterCall } from "../utils";
import { RouteConfig, RouteResponse,RouterError, Token, CairoSwap, Transaction, TransactionConfig } from "../types";

export class Router {
    private readonly url: string;

    constructor(url: string) {
        this.url = url;
    }

    async route(options: RouteConfig): Promise<RouteResponse | RouterError> {
        const res = await routeRequest<RouteResponse>(this.url, options);
        return res
    }

    async tokenList(): Promise<Token[]> {
        const res = await fetch(this.url + "/tokens");
        if (!res.ok) {
            throw new Error(res.statusText);
        } else {
            return res.json();
        }
    }

    buildTransaction(config: TransactionConfig): Transaction {
        const setInput: CairoSwap[] = formatRouterCall(
            config.route,
            config.slippage,
            config.accountAddress
        );
        const transaction: Transaction = {
            contractAddress: config.routerAddress,
            entryPoint: "swap",
            call_data: setInput
        }
        return transaction
    }

}
 