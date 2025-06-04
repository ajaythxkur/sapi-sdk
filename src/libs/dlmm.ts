import { getBinIdFromPrice } from "./dlmm-math";

export class DLMM {
    abiAddress: string;
    constructor(network="mainnet") {
        if(network === "mainnet") {
            this.abiAddress = "0xnotDeployed"
        } else {
            this.abiAddress = "0xTestnet"
        }
    }

    createPool(
        baseToken: string,
        quoteToken: string,
        baseFeeBps: number,
        binStep: number,
        initialPrice: number
    ) {
        const binId = getBinIdFromPrice(initialPrice, binStep, true);
        const binIdBelowZero = binId < 0;
        const activeId = Math.abs(binId);
        const txnData = {
            function: `${this.abiAddress}::scripts::create_pool`,
            typeArguments: [],
            functionArguments: [
                baseToken,
                quoteToken,
                baseFeeBps,
                binStep,
                activeId,
                binIdBelowZero
            ]
        };
        return txnData
    }


}