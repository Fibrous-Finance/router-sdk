import { ethers } from "ethers";

export function account(
    privateKey: string,

    rpcUrl: string,
) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const account0 = new ethers.Wallet(privateKey, provider);
    return account0;
}
