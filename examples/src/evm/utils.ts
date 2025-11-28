// HyperEVM Transaction SDK for TypeScript

import { TransactionReceipt } from "ethers";
import { TransactionResponse } from "ethers";
import { EXPLORER_MAP } from "./constants";

export interface TransactionParams {
    to: string;
    value?: bigint | string;
    data?: string;
    gasLimit?: number;
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    nonce?: number;
    type?: 0 | 1 | 2; // Legacy, EIP-2930, EIP-1559
}

export interface TransactionResult {
    hash: string;
    receipt?: TransactionReceipt;
    status: "pending" | "confirmed" | "failed";
    gasUsed?: bigint;
}

export async function monitorTransaction(
    tx: TransactionResponse,
): Promise<TransactionResult> {
    try {
        const receipt = await tx.wait();
        const explorerUrl = EXPLORER_MAP.find(
            (chain) => chain.chain_name == "hyperevm",
        )?.explorer_url;
        console.log("=".repeat(60));
        console.log("Transaction Details");
        console.log("=".repeat(60));
        console.log(`Status: ${receipt.status === 1 ? "confirmed" : "failed"}`);
        console.log(`Gas Used: ${receipt.gasUsed}`);
        console.log(`Block Number: ${receipt.blockNumber}`);
        console.log(`Tx Hash: ${receipt.hash}
Explorer Link: ${explorerUrl}${receipt.hash}`);
    } catch (error) {
        console.error("Error monitoring transaction: ", error);
        return {
            hash: tx.hash,
            status: "failed",
        };
    }
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
