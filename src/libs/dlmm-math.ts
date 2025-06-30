import Decimal from "decimal.js";
import { BASIS_POINT_MAX } from "./constants";
import gaussian, { Gaussian } from "gaussian";
import BN from "bn.js";

export function getPricePerOctas(
    tokenXDecimal: number,
    tokenYDecimal: number,
    price: number | string
): string {
    return new Decimal(price)
        .mul(new Decimal(10 ** (tokenYDecimal - tokenXDecimal)))
        .toString();
}

export function getBinIdFromPrice(
    price: string | number | Decimal,
    binStep: number,
    min: boolean
): number {
    const binStepNum = new Decimal(binStep).div(new Decimal(BASIS_POINT_MAX));
    const binId = new Decimal(price)
        .log()
        .dividedBy(new Decimal(1).add(binStepNum).log());
    return (min ? binId.floor() : binId.ceil()).toNumber();
}

export function getPriceOfBinByBinId(
    binId: number, 
    binStep: number
): Decimal {
  const binStepNum = new Decimal(binStep).div(new Decimal(BASIS_POINT_MAX));
  return new Decimal(1).add(new Decimal(binStepNum)).pow(new Decimal(binId));
} 


export function getPriceFromOctas(
    tokenXDecimal: number,
    tokenYDecimal: number,
    octaPrice: number | string
): string {
    return new Decimal(octaPrice)
        .div(new Decimal(10 ** (tokenYDecimal - tokenXDecimal)))
        .toString();
}

export function buildGaussianFromBins(activeBin: number, binIds: number[]) {
    const smallestBin = Math.min(...binIds);
    const largestBin = Math.max(...binIds);
    // Define the Gaussian distribution. The mean will be active bin when active bin is within the bin ids. Else, use left or right most bin id as the mean.
    let mean = 0;
    const isAroundActiveBin = binIds.find(bid  => bid === activeBin);
    // The liquidity will be distributed surrounding active bin
    if(isAroundActiveBin) {
        mean = activeBin;;
    }
    // The liquidity will be distributed to the right side of the active bin.
    else if(activeBin < smallestBin) {
        mean = smallestBin;
    }
    // The liquidity will be distributed to the left side of active bin.
    else {
        mean = largestBin;
    };
    const TWO_STANDARD_DEVIATION = 4;
    const stdDev = (largestBin - smallestBin) / TWO_STANDARD_DEVIATION;
    const variance = Math.max(stdDev ** 2, 1);
    return gaussian(mean, variance);
}

export function generateBinLiquidityAllocation(
    gaussian: Gaussian,
    binIds: number[],
    invert: boolean
) {
    // if invert == true ? liquidity allocation will be higher in bins far from mean bin : liquidity allocation will be higher in bins near to mean bin
    const allocations = binIds.map(bid => 
        invert ? 1/gaussian.pdf(bid) : gaussian.pdf(bid)
    );
    const totalAllocations = allocations.reduce((acc, v) => acc + v, 0);
    // Gaussian impossible to cover 100%, normalized it to have total of 100%
    return allocations.map(a => a / totalAllocations);
}
export function calculateSpotDistribution(
  activeBin: number,
  binIds: number[]
): { binId: number; xAmountBpsOfTotal: BN; yAmountBpsOfTotal: BN }[] {
  if (!binIds.includes(activeBin)) {
    const { div: dist, mod: rem } = new BN(10_000).divmod(
      new BN(binIds.length)
    );
    const loss = rem.isZero() ? new BN(0) : new BN(1);

    const distributions =
      binIds[0] < activeBin
        ? binIds.map((binId) => ({
            binId,
            xAmountBpsOfTotal: new BN(0),
            yAmountBpsOfTotal: dist,
          }))
        : binIds.map((binId) => ({
            binId,
            xAmountBpsOfTotal: dist,
            yAmountBpsOfTotal: new BN(0),
          }));

    // Add the loss to the left most bin
    if (binIds[0] < activeBin) {
      distributions[0].yAmountBpsOfTotal.add(loss);
    }
    // Add the loss to the right most bin
    else {
      distributions[binIds.length - 1].xAmountBpsOfTotal.add(loss);
    }

    return distributions;
  }

  const binYCount = binIds.filter((binId) => binId < activeBin).length;
  const binXCount = binIds.filter((binId) => binId > activeBin).length;

  const totalYBinCapacity = binYCount + 0.5;
  const totalXBinCapacity = binXCount + 0.5;

  const yBinBps = new BN(10_000 / totalYBinCapacity);
  const yActiveBinBps = new BN(10_000).sub(yBinBps.mul(new BN(binYCount)));

  const xBinBps = new BN(10_000 / totalXBinCapacity);
  const xActiveBinBps = new BN(10_000).sub(xBinBps.mul(new BN(binXCount)));

  return binIds.map((binId) => {
    const isYBin = binId < activeBin;
    const isXBin = binId > activeBin;

    if (isYBin) {
      return {
        binId,
        xAmountBpsOfTotal: new BN(0),
        yAmountBpsOfTotal: yBinBps,
      };
    }

    if (isXBin) {
      return {
        binId,
        xAmountBpsOfTotal: xBinBps,
        yAmountBpsOfTotal: new BN(0),
      };
    }

    else {
      return {
        binId,
        xAmountBpsOfTotal: xActiveBinBps,
        yAmountBpsOfTotal: yActiveBinBps,
      };
    }
  });
}