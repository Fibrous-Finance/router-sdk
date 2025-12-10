import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

// IMPORTANT: This example is for the legacy version of the Fibrous Router SDK (v0.6.x)
// Please use the new version of the Fibrous Router SDK (v1.0.0) for the new features
// You can find the new version of the Fibrous Router SDK in the examples/src/starknet/v2 directory

async function main() {
    // Create a new router instance
    const fibrous = new FibrousRouter();
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "starknet")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }
    // Get the supported tokens for the Starknet chain
    const tokens = await fibrous.supportedTokens(chainId);
    /**
     * recommended that use the token address directly
     * because there may be more than one token with the same symbol.
     */
    const ethToken = tokens.get("eth"); // this search in only the tokens that are verified
    // if you want to search for a token that is not verified, you can use the getToken method
    // const ethToken = await fibrous.getToken(
    //     "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH address
    //     "starknet",
    // );
    const strkToken = tokens.get("strk");
    const usdcToken = tokens.get("usdc");
    const usdtToken = tokens.get("usdt");

    const tokenInAddress_1 = ethToken?.address;
    const tokenInAddress_2 = strkToken?.address;
    const tokenInAddress_3 = usdcToken?.address;

    const tokenOutAddress = usdtToken?.address;

    const tokenInDecimals_1 = ethToken?.decimals;
    const tokenInDecimals_2 = strkToken?.decimals;
    const tokenInDecimals_3 = usdcToken?.decimals;

    if (
        !tokenInAddress_1 ||
        !tokenInAddress_2 ||
        !tokenInAddress_3 ||
        !tokenOutAddress
    ) {
        throw new Error("Token not found");
    }

    if (!tokenInDecimals_1 || !tokenInDecimals_2 || !tokenInDecimals_3) {
        throw new Error("Token not found");
    }

    const inputAmounts = [
        BigInt(parseUnits("0.001", tokenInDecimals_1)), // 0.001 ETH
        BigInt(parseUnits("10", tokenInDecimals_2)), // 10 STRK
        BigInt(parseUnits("5", tokenInDecimals_3)), // 5 USDC
    ];

    const tokenInAddresses = [
        tokenInAddress_1,
        tokenInAddress_2,
        tokenInAddress_3,
    ];
    const tokenOutAddresses = [tokenOutAddress];
    const swapCalls = await fibrous.getBestRouteBatch(
        inputAmounts,
        tokenInAddresses,
        tokenOutAddresses,
        "starknet",
        { reverse: false, direct: false, excludeProtocols: [] },
    );

    console.log(swapCalls);
}

main();
