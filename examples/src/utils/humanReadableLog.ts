import { Token } from "fibrous-router-sdk";
import { EvmTransactionData } from "../../../src/types";
import { formatUnits } from "ethers";

/**
 * Logs swap call data in a human-readable format
 * @param callData - The  transaction data containing route and swap parameters
 * @param inputToken - The input token information
 * @param outputToken - The output token information
 * @param protocols - Protocol mapping for readable names
 */
export function humanReadableSwapCallDataLog(
    callData: EvmTransactionData,
    inputToken: Token,
    outputToken: Token,
    protocols: Record<string, number>,
): void {
    console.log("\n" + "=".repeat(60));
    console.log("🔄 SWAP TRANSACTION DETAILS");
    console.log("=".repeat(60));

    // Route Information
    const route = callData.route;
    console.log("\n📋 Route Information:");
    console.log(`  Token In:      ${inputToken.symbol}`);
    console.log(`  Token Out:     ${outputToken.symbol}`);
    console.log(`  Amount In:     ${formatAmount(route.amount_in, inputToken.decimals)} ${inputToken.symbol}`);
    console.log(
        `  Amount Out:    ${formatAmount(
            route.amount_out,
            outputToken.decimals,
        )} ${outputToken.symbol}`,
    );
    console.log(
        `  Min Received:  ${formatAmount(
            route.min_received,
            outputToken.decimals,
        )} ${outputToken.symbol}`,
    );
    console.log(`  Destination:   ${formatAddress(route.destination)}`);
    console.log(`  Swap Type:     ${getSwapTypeName(route.swap_type)}`);

    // Swap Parameters
    if (callData.swap_parameters && callData.swap_parameters.length > 0) {
        console.log(
            `\n🔗 Swap Parameters (${callData.swap_parameters.length} swaps):`,
        );

        callData.swap_parameters.forEach((swap, index) => {
            console.log(`\n  Swap ${index + 1}:`);
            console.log(`    From Token:    ${formatAddress(swap.token_in)}`);
            console.log(`    To Token:      ${formatAddress(swap.token_out)}`);
            console.log(
                `    Rate:          ${(Number(swap.rate) / 10 ** 4).toFixed(
                    2,
                )}%`,
            );
            console.log(
                `    Protocol ID:   ${getProtocolName(
                    swap.protocol_id,
                    protocols,
                )}`,
            );
            console.log(
                `    Pool Address:  ${formatAddress(swap.pool_address)}`,
            );
            console.log(
                `    Swap Type:     ${getSwapTypeName(swap.swap_type)}`,
            );

            if (swap.extra_data) {
                const extraData = Array.isArray(swap.extra_data)
                    ? swap.extra_data.join(", ")
                    : swap.extra_data;
                console.log(`    Extra Data:    ${extraData}`);
            }
        });
    } else {
        console.log("\n🔗 Swap Parameters: None");
    }

    console.log("\n" + "=".repeat(60) + "\n");
}

/**
 * Formats an Ethereum address for display
 */
function formatAddress(address: string): string {
    if (!address || address === "0x0000000000000000000000000000000000000000") {
        return "ETH (Native Token)";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

/**
 * Gets human-readable swap type name
 */
function getSwapTypeName(swapType: number): string {
    const swapTypes = new Map([
        [0, "ETH to Token"],
        [1, "Token to ETH"],
        [2, "Token to Token"],
    ]);

    return swapTypes.get(swapType) || `Unknown (${swapType})`;
}

/**
 * Gets human-readable protocol name from protocol mapping
 */
function getProtocolName(
    protocolId: number,
    protocols: Record<string, number>,
): string {
    const protocolName = Object.keys(protocols).find(
        (key) => protocols[key] === Number(protocolId),
    );
    return protocolName || `Protocol ${protocolId}`;
}
