import { Account, CairoVersion, Provider } from "starknet";

export function account(
    privateKey: string,
    public_key: string,
    isCairo1: string,
) {
    enum NetworkName {
        SN_MAIN = "SN_MAIN",
        SN_GOERLI = "SN_GOERLI",
        SN_GOERLI2 = "SN_GOERLI2",
    }
    const provider = new Provider({
        sequencer: {
            network: NetworkName.SN_MAIN,
        },
    });
    const account0 = new Account(
        provider,
        public_key,
        privateKey,
        isCairo1 as CairoVersion,
    );
    return account0;
}
