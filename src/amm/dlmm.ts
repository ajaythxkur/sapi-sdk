import { Network } from "@aptos-labs/ts-sdk";
import { getBinIdFromPrice } from "../libs/dlmm-math";
import { Strategy } from "../types/types";

export class DLMM {
    cA: string;
    constructor(network: Network) {
        if(network === Network.MAINNET) {
            this.cA = "0x1"
        };
        this.cA = "0x9fb0c0e685c7f5f090be74b635da0d88a1f3fec8a1377384ace4de704e33e5c4"
    }
    createPool(
        assetA: string,
        assetB: string,
        decimalsB: number,
        feeBps: number,
        binStepBps: number,
        initalPrice: number,
    ) {
        const price = initalPrice * Math.pow(10, decimalsB);
        const binId = getBinIdFromPrice(price, binStepBps, false);
        return {
            function: `${this.cA}::router::create_pool_entry`,
            typeArguments: [],
            functionArguments: [assetA, assetB, feeBps, binStepBps, binId]
        }
    }
    addLiquidity(
        poolAddr: string,
        lowerBinId: number,
        upperBinId: number,
        amountA: number,
        amountB: number,
        decimalsA: number,
        decimalsB: number,
        strategy: Strategy
    ) {
        const tokenAmountA = amountA * Math.pow(10, decimalsA);
        const tokenAmountB = amountB * Math.pow(10, decimalsB);
        return {
            function: `${this.cA}::router::add_liquidity_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, lowerBinId, upperBinId, tokenAmountA, tokenAmountB, strategy]
        }
    }
    updatePosition(
        poolAddr: string,
        positionNFT: string,
        lowerBinId: number,
        upperBinId: number,
        amountA: number,
        amountB: number,
        decimalsA: number,
        decimalsB: number,
        strategy: Strategy
    ) {
        const tokenAmountA = amountA * Math.pow(10, decimalsA);
        const tokenAmountB = amountB * Math.pow(10, decimalsB);
        return {
            function: `${this.cA}::router::update_position_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT, lowerBinId, upperBinId, tokenAmountA, tokenAmountB, strategy]
        }
    }
    removeLiquidity(
        poolAddr: string,
        positionNFT: string,
        lowerBinId: number,
        upperBinId: number,
        removePercentBps: number,
    ) {
        return {
            function: `${this.cA}::router::remove_liquidity_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT, lowerBinId, upperBinId, removePercentBps]
        }
    }
    closePosition(
        poolAddr: string,
        positionNFT: string,
    ) {
        return {
            function: `${this.cA}::router::close_position_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT]
        }
    }
    claimFees(
        poolAddr: string,
        positionNFT: string,
    ) {
        return {
            function: `${this.cA}::router::claim_fees_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT]
        }
    }
    claimFeesAll(
        poolAddr: string[],
        positionNFT: string[],
    ) {
        return {
            function: `${this.cA}::router::claim_fees_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT]
        }
    }
    swapA2B(
        poolAddr: string,
        amountIn: number,
    ) {
        return {
            function: `${this.cA}::router::swap_a2b_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, amountIn]
        }
    }
    swapB2A(
        poolAddr: string,
        amountIn: number,
    ) {
        return {
            function: `${this.cA}::router::swap_b2a_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, amountIn]
        }
    }
}