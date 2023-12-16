import { Account, CairoVersion, RpcProvider, constants } from "starknet";

export function account(
    privateKey: string,
    public_key: string,
    isCairo1: string,
) {
    enum NetworkName {
        SN_MAIN = "SN_MAIN",
        SN_GOERLI = "SN_GOERLI",
    }
    const provider = new Provider({
        network: constants.NetworkName.SN_MAIN
    });
    const account0 = new Account(
        provider,
        public_key,
        privateKey,
        isCairo1 as CairoVersion,
    );
    return account0;
}
