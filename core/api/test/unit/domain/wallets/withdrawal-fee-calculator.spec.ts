import { OnChainFees } from "@/domain/wallets"
// import { AmountCalculator } from "@/domain/shared"

import { generateTxSizeCases } from "test/helpers/withdrawal-fee-calculator"
import {
  onchainFeeSettingsMock,
  TRANSACTION_SIZE_MATRIX,
} from "test/mocks/withdrawal-fee-calculator"

// const calc = AmountCalculator()
const txSizeCases = generateTxSizeCases(TRANSACTION_SIZE_MATRIX)
const feeCalculator = OnChainFees({
  onchain: onchainFeeSettingsMock,
})

describe("OnChainFees", () => {
  describe("calculateTransactionSize", () => {
    test.each(txSizeCases)(
      "inputs=%i, outputs=%i => %i bytes",
      (inputs: number, outputs: number, expectedSize: number) => {
        const size = feeCalculator.calculateTransactionSize(inputs, outputs)
        expect(size).toBe(expectedSize)
      },
    )
  })

  describe("onChainIntraLedgerFee", () => {
    it("always returns zero", async () => {
      const fee = feeCalculator.intraLedgerFees()
      expect(fee.btc.amount).toEqual(0n)
      expect(fee.usd.amount).toEqual(0n)
    })
  })
})
