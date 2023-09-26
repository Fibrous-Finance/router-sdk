import { uint256 } from "starknet";



export function approveToERC20(amount:string, tokenAddress: string, operatorAddress: string) {
    const amountHex = uint256.bnToUint256(amount);
    const res = {
        contractAddress: tokenAddress,
        entrypoint: "approve",
        calldata: [operatorAddress, amountHex.low, amountHex.high],
    };
    return res
}