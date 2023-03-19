import { RouteConfig, RouteResponse,RouterResponse, RouterError,CairoSwap,trimPercent,parsePercent,Token, Route
 } from "../types"

export async function routeRequest<T>(url: string, params: RouteConfig): Promise<RouteResponse | RouterError > {
    const requestUrl = url + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')
    const res = await fetch(requestUrl)
    return res.json()
}


  
/**
 * Formats the response from the Fibrous API into a flattened array of swaps
 * @param res Response from the Fibrous API
 * @returns Flattened array of swaps, ready to be passed to the Starknet contract
 */
export function formatRouterCall(
  res: RouterResponse,
  slippage: number,
  destination: string
): any[] { // TODO: CairoSwap[]
  const SLIPPAGE_EXTENSION = 10 ** 6;
  const UINT256_ZERO = "0";

  const flatResponse: CairoSwap[] = [];

  let remainingRoutePercent = 100;

  // Input assumption: res.route.reduce((p, r) => p + r.percent, 0) == 100
  for (const route of res.route) {
    const routePercent = trimPercent(route.percent);
    const execPercent = routePercent / remainingRoutePercent;
    remainingRoutePercent -= routePercent;

    for (let i = 0; i < route.swaps.length; i++) {
      const hop = route.swaps[i];

      let hopPercent = i == 0 ? execPercent : 1;
      let remainingSwapPercent = 100;

      // Input assumption: hop.reduce((p, swap) => p + swap.percent, 0) == 100
      // Invariant: remainingSwapPercent >= 0
      // Proof by induction: base case is true, and we decrease remainingSwapPercent
      // by swapPercent in each iteration, so it will eventually reach 0.

      for (const swap of hop) {
        const swapPercent = trimPercent(swap.percent);
        const swapExecPercent =
          (swapPercent / remainingSwapPercent) * hopPercent;
        remainingSwapPercent -= swapPercent;

        flatResponse.push([
          swap.fromTokenAddress, // token_in
          swap.toTokenAddress, // token_out
          parsePercent(swapExecPercent), // rate
          String(swap.protocol), // protocol
          swap.poolAddress, // pool_address
        ]);
      }
    }
  }

  const minReceived =
    (BigInt(res.outputAmount) * BigInt((1 - slippage) * SLIPPAGE_EXTENSION)) /
    BigInt(SLIPPAGE_EXTENSION);
  return [
    String(flatResponse.length),
    ...flatResponse.flat(),
    res.inputToken.address,
    res.outputToken.address,
    res.inputAmount,
    UINT256_ZERO,
    String(minReceived),
    UINT256_ZERO,
    destination,
];
}