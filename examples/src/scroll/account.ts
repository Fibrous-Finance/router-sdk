import { ethers } from "ethers";

export function account(
    privateKey: string,

    rpc_url: string,
) {
    const provider = new ethers.JsonRpcProvider(rpc_url);
    const account0 = new ethers.Wallet(privateKey, provider);
    return account0;
}
