import { WalletCurrency, ZERO_SATS } from "@/domain/shared"

export const OnChainExpDecayFees = ({
  onchain,
}: OnchainExpDecayConfig): OnChainFeeExpDecayCalculator => {
  const expDecayFee = ({
    amount,
    speed,
    feeRate,
    minerFee,
  }: {
    amount: BtcPaymentAmount
    minerFee: BtcPaymentAmount
    speed: PayoutSpeed
    feeRate: number
  }) => {
    const satoshis = Number(amount.amount)
    const minerCost = Number(minerFee.amount)

    if (feeRate <= 0) {
      return {
        totalFee: ZERO_SATS,
        bankFee: ZERO_SATS,
      }
    }

    const dynamicRate = calculateDynamicFeeRate({ amount: satoshis, speed, feeRate })
    const baseMultiplier = calculateBaseMultiplier({ speed, feeRate })

    const bankFee: BtcPaymentAmount = {
      amount: BigInt(Math.round(satoshis * dynamicRate + minerCost * baseMultiplier)),
      currency: WalletCurrency.Btc,
    }

    return {
      totalFee: bankFee,
      bankFee,
    }
  }

  const calculateExponentialDecay = (args: ExponentialDecayArgs): number => {
    const { amount, minRate, maxRate, threshold, minAmount, exponentialFactor } = args
    const span = threshold - minAmount
    const exponent = -((amount - minAmount) / span) * exponentialFactor
    return minRate + (maxRate - minRate) * Math.exp(exponent)
  }

  const calculateDecayRate: DecayRateCalculator = (amount, params) => {
    const { threshold, minSats, exponentialFactor } = onchain.decayConstants
    const { minRate, maxRate, divisor } = params

    if (amount < threshold) {
      return calculateExponentialDecay({
        amount,
        minRate,
        maxRate,
        threshold,
        minAmount: minSats,
        exponentialFactor,
      })
    }

    return divisor / amount
  }

  const calculateNormalizedFactor = (args: NormalizedFactorArgs): number => {
    const { feeRate } = args
    const { min, max } = onchain.decayConstants.networkFeeRange
    return (feeRate - min) / (max - min)
  }

  const calculateDynamicFeeRate: DynamicRateCalculator = (args: DynamicRateArgs) => {
    const { amount, speed, feeRate } = args
    const { targetRate, ...decayParams } = onchain.decay[speed]
    const decay = calculateDecayRate(amount, decayParams)
    const normalizedFactor = calculateNormalizedFactor({ feeRate })
    return decay + normalizedFactor * (targetRate - decay)
  }

  const calculateBaseMultiplier: BaseMultiplierCalculator = (
    args: BaseMultiplierArgs,
  ) => {
    const { speed, feeRate } = args
    const { factors, offsets } = onchain.multiplier
    return factors[speed] / feeRate + offsets[speed]
  }

  return {
    expDecayFee,
    calculateBaseMultiplier,
  }
}
