import { Network } from "@aptos-labs/ts-sdk";
import { getBinIdFromPrice } from "../libs/dlmm-math";
import { DlmmPool, DlmmPoolPair, EntryFunctionData, Strategy } from "../types/types";
import { getSinglePoolTokenData, groupPoolsByTokenPair } from "../libs/sdk-helper";
import { getTokens } from "./token";

type PoolConfig = {
    network: string;
    mode: "production" | "local"
}
export class DLMM {
    cA: string;
    apiUrl: string;
    constructor(config: PoolConfig) {
        if(config.network === Network.MAINNET) {
            this.cA = "0x1"
        } else {
            this.cA = "0x9fb0c0e685c7f5f090be74b635da0d88a1f3fec8a1377384ace4de704e33e5c4"
        };
        if(config.mode === "production") {
            this.apiUrl = "http://localhost:8081"
        } else {
            this.apiUrl = "http://localhost:8081"
        }
    }
    createPool(
        assetA: string,
        assetB: string,
        decimalsB: number,
        feeBps: number,
        binStepBps: number,
        initalPrice: number,
        protocolFee: number = 0,
    ): EntryFunctionData {
        const price = initalPrice * Math.pow(10, decimalsB);
        const binId = getBinIdFromPrice(price, binStepBps, false);
        return {
            function: `${this.cA}::router::create_pool_entry`,
            typeArguments: [],
            functionArguments: [assetA, assetB, feeBps, binStepBps, binId, protocolFee]
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
    ): EntryFunctionData  {
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
    ): EntryFunctionData  {
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
    ): EntryFunctionData  {
        return {
            function: `${this.cA}::router::remove_liquidity_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT, lowerBinId, upperBinId, removePercentBps]
        }
    }
    closePosition(
        poolAddr: string,
        positionNFT: string,
    ): EntryFunctionData  {
        return {
            function: `${this.cA}::router::close_position_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT]
        }
    }
    claimFees(
        poolAddr: string,
        positionNFT: string,
    ): EntryFunctionData  {
        return {
            function: `${this.cA}::router::claim_fees_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT]
        }
    }
    claimFeesAll(
        poolAddr: string[],
        positionNFT: string[],
    ): EntryFunctionData  {
        return {
            function: `${this.cA}::router::claim_fees_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, positionNFT]
        }
    }
    swapA2B(
        poolAddr: string,
        amountIn: number,
    ): EntryFunctionData  {
        return {
            function: `${this.cA}::router::swap_a2b_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, amountIn]
        }
    }
    swapB2A(
        poolAddr: string,
        amountIn: number,
    ): EntryFunctionData  {
        return {
            function: `${this.cA}::router::swap_b2a_entry`,
            typeArguments: [],
            functionArguments: [poolAddr, amountIn]
        }
    }
    async getPools(): Promise<{ data: DlmmPoolPair[], source: string } | undefined> {
        try {
            const res = await fetch(`${this.apiUrl}/v1/pools/dlmm/getAll`);
            const r = await res.json();
            const tokenData = await getTokens(this.apiUrl);
            if(!tokenData) throw new Error("Tokens not found")
            const pools = groupPoolsByTokenPair(r.data, tokenData.data);
            return {
                ...r,
                data: pools,
            }
        } catch (err) {
            console.log(`Error in getPools: `, err)
            return undefined;
        }
    }
    async getPool(poolAddr: string): Promise<{ data: DlmmPool, source: string } | undefined> {
        try {
            const res = await fetch(`${this.apiUrl}/v1/pools/dlmm/get/${poolAddr}`);
            const r = await res.json();
            const tokenData = await getTokens(this.apiUrl);
            if(!tokenData) throw new Error("Tokens not found")
            const data = getSinglePoolTokenData(r.data as DlmmPool, tokenData.data);
            return {
                ...r,
                data,
            }
        } catch (err) {
            return undefined;
        }
    }
}