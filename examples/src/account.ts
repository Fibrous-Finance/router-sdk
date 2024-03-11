import { Account, CairoVersion, Provider, RpcProvider } from "starknet";

export function account(
    privateKey: string,
    public_key: string,
    isCairo1: string,
    rpc_url: string,
) {
    const provider = new RpcProvider({
        nodeUrl: rpc_url,
    });
    const account0 = new Account(
        provider,
        public_key,
        privateKey,
        isCairo1 as CairoVersion,
    );
    return account0;
}
