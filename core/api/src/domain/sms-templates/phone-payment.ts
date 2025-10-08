import { WalletCurrency } from "@/domain/shared"
import { toSats } from "@/domain/bitcoin"
import { toCents } from "@/domain/fiat"

export const phonePaymentSmsTemplate = ({
  amount,
  currency,
  phoneNumber,
}: PhonePaymentTemplateParams): string => {
  const currencyAmount =
    currency === WalletCurrency.Btc
      ? Number(toSats(amount))
      : Number(toCents(amount)) / 100

  const formattedAmount =
    currency === WalletCurrency.Btc
      ? `${currencyAmount} SAT`
      : `$${currencyAmount.toFixed(2)}`

  return `A friend sent you ~${formattedAmount} in Bitcoin! The funds are in your Blink Wallet in the account with your phone number ${phoneNumber}. If you don't have Blink on this phone get it here: https://get.blink.sv`
}
