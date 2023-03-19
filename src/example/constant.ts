import { TransactionConfig ,Protocol} from "../types";
export const SMART_ORDER_ROUTER_API =  "https://api.fibrous.finance/route";
export const EXAMPLE_TX_CONFIG: TransactionConfig = {
    routerAddress: "0x00",
    accountAddress: "0x00",
    route: {
        success: true,
        inputToken: {
            address: "0x00",
            decimals: 18,
            symbol: "ETH",
            name: "Ether",
            isBase: true,
            isNative: true,
            price: 0,

        },
        inputAmount: "1000000000000000000",
        outputToken: {
            address: "0x00",
            decimals: 18,
            symbol: "USDC",
            name: "USD Coin",
            isBase: true,
            isNative: false,
            price: 0,
        },
        outputAmount: "1000000000000000000",
        estimatedGasUsed: "1000000000000000000",
        route: [
            {
                percent: "100.0000%",
                swaps: [
                    [
                        {
                            protocol: Protocol.UniswapV2,
                            poolId: "0x00",
                            poolAddress: "0x00",
                            fromTokenAddress: "0x00",
                            toTokenAddress: "0x00",
                            percent: "100.0000%"
                        }
                    ]
                ]
            }
        ],
        time: 0
    },
    slippage: 0.5
}
