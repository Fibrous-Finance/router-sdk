import { Account, CairoVersion, Provider, RpcProvider } from "starknet";

export function account(
    privateKey: string,
    publicKey: string,
    isCairo1: string,
    rpcUrl: string,
) {
    const provider = new RpcProvider({
        nodeUrl: rpcUrl,
    });
    const account0 = new Account(provider, publicKey, privateKey);
    return account0;
}
