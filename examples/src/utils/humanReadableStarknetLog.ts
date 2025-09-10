import { Token } from "fibrous-router-sdk";
import { EvmTransactionData } from "../../../src/types";
import { formatUnits } from "ethers";
import { CallData, uint256 } from "starknet";

/**
 * Logs swap call data in a human-readable format
 * @param callData - The  transaction data containing route and swap parameters
 * @param inputToken - The input token information
 * @param outputToken - The output token information
 * @param protocols - Protocol mapping for readable names
 */
export function humanReadableStarknetSwapCallDataLog(
    callData: any,
    inputToken: any,
    outputToken: any,
    protocols: Record<string, number>,
): void {
    console.log("\n" + "=".repeat(60));
    console.log("🔄 SWAP TRANSACTION DETAILS");
    console.log("=".repeat(60));

    // Route Information
    console.log("\n📋 Route Information:");
    console.log(`  Token In:      ${inputToken.symbol}`);
    console.log(`  Token Out:     ${outputToken.symbol}`);
    const amountIn = uint256.uint256ToBN({low: callData.calldata[2], high: callData.calldata[3]});
    const minAmountOut = uint256.uint256ToBN({low: callData.calldata[4], high: callData.calldata[5]});
    const destination = callData.calldata[6];

    console.log(`  Amount In:     ${formatAmount(amountIn.toString(), Number(inputToken.decimals))} ${inputToken.symbol}`);
    console.log(`  Min Amount Out: ${formatAmount(minAmountOut.toString(), Number(outputToken.decimals))} ${outputToken.symbol}`);
    console.log(`  Destination:   ${destination}`);

    console.log("\n" + "=".repeat(60) + "\n");
}



/**
 * Formats amount values for display
 */
function formatAmount(amount: string, decimals: number): number {
    try {
        const bigIntAmount = BigInt(amount);
        const formatted = formatUnits(bigIntAmount, decimals);
        return parseFloat(formatted);
    } catch (error) {
        return parseFloat(amount);
    }
}

