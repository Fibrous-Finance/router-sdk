import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "starknet")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    // Build route options
    const tokens = await fibrous.supportedTokens(chainId);
    const inputToken = await fibrous.getToken(
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH address
        chainId,
    );
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("strk"); // this search in only the tokens that are verified
    // if you want to search for a token that is not verified, you can use the getToken method
    // const outputToken = await fibrous.getToken(
    //     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK address
    //     "starknet",
    // );
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken.decimals);
    const inputAmount = BigInt(parseUnits("0.01", tokenInDecimals)); // 0.01 ETH
    const reverse = false;
    // Converting 1 ETH to STRK
    const route = await fibrous.getBestRoute(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        "starknet", // chainName will be deprecated in the future, use chainId instead
        {
            reverse: false,
            direct: false,
            excludeProtocols: [],
        },
        chainId,
    );
    console.log("route", route);
}

main();
