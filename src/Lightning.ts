const lnService = require('ln-service');
const assert = require('assert').strict;
import { createHash, randomBytes } from "crypto";
import { brokerLndPath, brokerPath, customerPath, lightningAccountingPath } from "./ledger";
import { disposer } from "./lock";
import { InvoiceUser, MainBook, Transaction, User } from "./mongodb";
import { sendInvoicePaidNotification } from "./notification";
import { IAddInvoiceInternalRequest, IPaymentRequest } from "./types";
import { getAuth, LoggedError, timeout } from "./utils";
import { regExUsername } from "./wallet";
import moment from "moment"

const util = require('util')

const using = require('bluebird').using

const TIMEOUT_PAYMENT = process.env.NETWORK !== "regtest" ? 45000 : 3000

const FEECAP = 0.02 // = 2%
const FEEMIN = 10 // sats

export type ITxType = "invoice" | "payment" | "onchain_receipt" | "onchain_payment" | "on_us"
export type payInvoiceResult = "success" | "failed" | "pending"

export const delay = (currency) => {
  return {
    "BTC": {value: 1, unit: 'days'},
    "USD": {value: 2, unit: 'mins'},
  }[currency]
}

export const LightningMixin = (superclass) => class extends superclass {
  lnd = lnService.authenticatedLndGrpc(getAuth()).lnd
  nodePubKey: string | null = null

  // FIXME: need ! otherwise have `Property isUsd has no initializer and is not definitely assigned in the constructor`
  // which doesn't seems to make sense
  readonly isUsd!: boolean

  constructor(...args) {
    super(...args)
    this.isUSD = this.currency === "USD"
  }

  async getNodePubkey() {
    this.nodePubKey = this.nodePubKey ?? (await lnService.getWalletInfo({ lnd: this.lnd })).public_key
    return this.nodePubKey
  }

  async updatePending() {
    await Promise.all([
      this.updatePendingInvoices(),
      this.updatePendingPayments(),
      super.updatePending(),
    ])
  }
  
  getExpiration = (input) => {
    // console.log(delay(this.currency).value, delay(this.currency).unit, "getExpiration unit")
    return input.add(delay(this.currency).value, delay(this.currency).unit)
  }

  async addInvoiceInternal({ sats, usd, memo, selfGenerated }: IAddInvoiceInternalRequest): Promise<string> {
    let request, id

    const expires_at = this.getExpiration(moment()).toDate()

    try {
      const result = await lnService.createInvoice({
        lnd: this.lnd,
        tokens: sats,
        description: memo,
        expires_at
      })
      request = result.request
      id = result.id
    } catch (err) {
      const error = "impossible to create the invoice"
      this.logger.error({err}, error)
      throw new LoggedError(error)
    }

    try {
      const result = await new InvoiceUser({
        _id: id,
        uid: this.uid,
        usd,
        currency: this.currency,
        selfGenerated,
      }).save()
    } catch (err) {
      // FIXME if the mongodb connection has not been instanciated
      // this fails silently
      const error = `error storing invoice to db`
      this.logger.error({err}, error)
      throw new LoggedError(error)
    }

    this.logger.info({sats, usd, memo, currency: this.currency, selfGenerated, id, uid: this.uid}, "a new invoice has been added")

    return request
  }

  async validate(params: IPaymentRequest, lightningLogger) {

    const keySendPreimageType = '5482373484';
    const preimageByteLength = 32;

    let pushPayment = false
    let tokens
    let expires_at
    let features
    let cltv_delta
    let payment
    let destination, id, description
    let routeHint = []
    let messages: Object[] = []
    
    if (params.invoice) {
      // TODO: replace this with invoices/bolt11/parsePaymentRequest function?
      // TODO: use msat instead of sats for the db?

      try {
        ({ id, safe_tokens: tokens, destination, description, routes: routeHint, payment, cltv_delta, expires_at, features } = await lnService.decodePaymentRequest({ lnd: this.lnd, request: params.invoice }))
      } catch (err) {
        const error = `Error decoding the invoice`
        lightningLogger.error({params, success: false, error}, error)
        throw new LoggedError(error)
      }

      // TODO: if expired_at expired, thrown an error

      if (!!params.amount && tokens !== 0) {
        const error = `Invoice contains non-zero amount, but amount was also passed separately`
        lightningLogger.error({tokens, params, success: false, error}, error)
        throw new LoggedError(error)
      }

    } else {
      if (!params.destination) {
        const error = 'Pay requires either invoice or destination to be specified'
        lightningLogger.error({invoice: params.invoice, destination, success: false, error}, error)
        throw new LoggedError(error)
      }

      pushPayment = true
      destination = params.destination

      const preimage = randomBytes(preimageByteLength);
      id = createHash('sha256').update(preimage).digest().toString('hex');
      const secret = preimage.toString('hex');
      messages = [{ type: keySendPreimageType, value: secret }]

      // TODO: should it be id or secret?
      // check from keysend invoices generated by lnd
      // payment = payment ?? secret

    }

    if (!params.amount && tokens === 0) {
      const error = 'Invoice is a zero-amount invoice, or pushPayment is being used, but no amount was passed separately'
      lightningLogger.error({tokens, params, success: false, error}, error)
      throw new LoggedError(error)
    }

    tokens = !!tokens ? tokens : params.amount

    return { tokens, destination, pushPayment, id, routeHint, messages, 
      memoInvoice: description, memoPayer: params.memo, payment, cltv_delta, expires_at, features, username: params.username }
  }

  async pay(params: IPaymentRequest): Promise<payInvoiceResult | Error> {
    let lightningLogger = this.logger.child({ topic: "payment", protocol: "lightning", transactionType: "payment" })
    
    const { tokens, destination, pushPayment, id, routeHint, messages, memoInvoice, memoPayer, payment, cltv_delta, features, username } = await this.validate(params, lightningLogger)

    // not including message because it contains the preimage and we don't want to log this
    lightningLogger = lightningLogger.child({ decoded: {tokens, destination, pushPayment, id, routeHint, memoInvoice, memoPayer, payment, cltv_delta, features}, params })

    let fee
    let route

    // TODO: this should be inside the lock.
    // but getBalance is currently also getting the lock. 
    // --> need a re-entrant mutex or another architecture to have balance within the lock
    const balance = await this.getBalance()

    return await using(disposer(this.uid), async (lock) => {
      const lightningLoggerOnUs = lightningLogger.child({ onUs: true, fee: 0 })

      // On us transaction
      if (destination === await this.getNodePubkey()) {
        let payeeUid, payeeCurrency

        if (pushPayment) {
          if (!username) {
            const error = 'a username is required for push payment to the ***REMOVED*** wallet'
            lightningLoggerOnUs.warn({ success: false, error }, error)
            throw new LoggedError(error)
          }

          const payee = await User.findOne({ username: regExUsername({username}) })
          if (!payee) {
            const error = `this username doesn't exist`
            lightningLoggerOnUs.warn({ success: false, error }, error)
            throw new LoggedError(error)
          }

          payeeUid = payee._id
          payeeCurrency = payee.currency

        } else {

          const payeeInvoice = await InvoiceUser.findOne({ _id: id })
          if (!payeeInvoice) {
            const error = 'User tried to pay invoice from the same wallet, but it was already paid or does not exist'
            lightningLoggerOnUs.error({ success: false, error }, error)
            throw new LoggedError(error)
            // FIXME: Using == here because === returns false even for same uids
          }

          payeeUid = payeeInvoice.uid
          payeeCurrency = payeeInvoice.currency
        }

        if (payeeUid == this.uid) {
          const error = 'User tried to pay himself'
          lightningLoggerOnUs.error({ success: false, error }, error)
          throw new LoggedError(error)
        }

        // TODO XXX FIXME:
        // manage the case where a user in USD tries to pay another used in BTC with an onUS transaction
        assert(this.currency == payeeCurrency)

        const sats = tokens
        const metadata = { currency: this.currency, hash: id, type: "on_us", pending: false, ...this.getCurrencyEquivalent({sats, fee: 0}) }

        const value = this.isUSD ? metadata.usd : sats

        if (balance < value) {
          const error = `balance is too low`
          lightningLoggerOnUs.error({balance, value, success: false, error}, error)
          throw new LoggedError(error)
        }

        await MainBook.entry(memoInvoice)
          .debit(customerPath(payeeUid), value, metadata)
          .credit(this.accountPath, value, {...metadata, memoPayer})
          .commit()
      
        await sendInvoicePaidNotification({amount: tokens, uid: payeeUid, hash: id, logger: this.logger })

        if (!pushPayment) {
          const resultDeletion = await InvoiceUser.deleteOne({ _id: id })
          this.logger.info({id, uid: this.uid, resultDeletion}, "invoice has been deleted following on_us transaction")
          
          await lnService.cancelHodlInvoice({ lnd: this.lnd, id })
          this.logger.info({id, uid: this.uid}, "canceling invoice")
        }
          
        lightningLoggerOnUs.info({success: true, isReward: params.isReward ?? false, ...metadata}, "lightning payment success")

        return "success"
      }

      // "normal" transaction: paying another lightning node

      if (pushPayment) {
        const error = "no push payment to other wallet (yet)"
        lightningLogger.error({ success: false }, error)
        throw new LoggedError(error)
      }

      const max_fee = Math.floor(Math.max(FEECAP * tokens, FEEMIN))

      // TODO: fine tune those values:
      // const probe_timeout_ms
      // const path_timeout_ms

      const mtokens = tokens * 1000

      // TODO: push payment for other node as well
      lightningLogger = lightningLogger.child({ onUs: false, max_fee })


      try {
        ({ route } = await lnService.probeForRoute({ lnd: this.lnd, 
          destination, mtokens, routes: routeHint, cltv_delta, features, max_fee, messages, 
          
          // FIXME: this fails for push payment. not adding this for now.
          // payment, total_mtokens: mtokens,

        }));
      } catch (err) {
        const error = "error getting route / probing for route"
        lightningLogger.error({ err, max_fee, probingSuccess: false, success: false }, error)
        throw new LoggedError(error)
      }

      if (!route) {
        const error = "there is no potential route for payment"
        lightningLogger.warn({ probingSuccess: false, success: false }, error)
        throw new LoggedError(error)
      }

      // we are confident enough that there is a possible payment route. let's move forward
      // TODO quote for fees, and also USD for USD users

      let journal 

      {
        fee = route.safe_fee
        const sats = tokens + fee

        lightningLogger = lightningLogger.child({ probingSuccess: true, route, balance, fee, sats })
        const metadata = { currency: this.currency, hash: id, type: "payment", pending: true, fee, ...this.getCurrencyEquivalent({sats, fee }) }

        const value = this.isUSD ? metadata.usd : sats

        if (balance < value) {
          const error = `balance is too low`
          lightningLogger.warn({ success: false, error }, error)
          throw new LoggedError(error)
        }

        if (pushPayment) {
          route.messages = messages
        }

        // TODO: brokerLndPath should be cached
        const path = this.isUSD ? await brokerLndPath() : this.accountPath

        // reduce balance from customer first

        journal = MainBook.entry(memoInvoice)
          .debit('Assets:Reserve:Lightning', sats, {...metadata, currency: "BTC"})
          .credit(path, sats, {...metadata, currency: "BTC"})
        
        if(this.isUSD) {
          journal
            .debit(brokerPath, metadata.usd, {...metadata, currency: "USD"})
            .credit(this.accountPath, metadata.usd, {...metadata, currency: "USD"})
        }

        await journal.commit()

        // there is 3 scenarios for a payment.
        // 1/ payment succeed is less than TIMEOUT_PAYMENT
        // 2/ the payment fails. we are reverting it. this including voiding prior transaction
        // 3/ payment is still pending after TIMEOUT_PAYMENT.
        // we are timing out the request for UX purpose, so that the client can show the payment is pending
        // even if the payment is still ongoing from lnd.
        // to clean pending payments, another cron-job loop will run in the background.

        try {

          // Fixme: seems to be leaking if it timeout.
          const promise = lnService.payViaRoutes({ lnd: this.lnd, routes: [route], id })

          await Promise.race([promise, timeout(TIMEOUT_PAYMENT, 'Timeout')])
          // FIXME
          // return this.payDetail({
          //     pubkey: details.destination,
          //     hash: details.id,
          //     amount: details.tokens,
          //     routes: details.routes
          // })

        } catch (err) {

          if (err.message === "Timeout") {
            lightningLogger.warn({ ...metadata, pending: true }, 'timeout payment')

            return "pending"
            // pending in-flight payment are being handled either by a cron job 
            // or payment update when the user query his balance
          }

          try {
            // FIXME: this query may not make sense 
            // where multiple payment have the same hash
            // ie: when a payment is being retried
            await Transaction.updateMany({ hash: id }, { pending: false, error: err[1] })
            await MainBook.void(journal.journal._id, err[1])
            lightningLogger.warn({ success: false, err, ...metadata }, `payment error`)

          } catch (err_fatal) {
            const error = `ERROR CANCELING PAYMENT ENTRY`
            lightningLogger.fatal({err, err_fatal, entry: journal}, error)
            throw new LoggedError(error)
          }

          throw new LoggedError(`error paying invoice ${util.inspect({ err }, false, Infinity)}`)
        }

        // success
        await Transaction.updateMany({ hash: id }, { pending: false })
        lightningLogger.info({ success: true, ...metadata }, `payment success`)
      }

      return "success"

    })
  }

  async updatePendingPayments() {

    const query = { account_path: this.accountPathMedici, type: "payment", pending: true }
    const count = await Transaction.count(query)

    if (count === 0) {
      return
    }

    return await using(disposer(this.uid), async (lock) => {

      const payments = await Transaction.find(query)

      for (const payment of payments) {

        let result
        try {
          result = await lnService.getPayment({ lnd: this.lnd, id: payment.hash })
        } catch (err) {
          const error = 'issue fetching payment'
          this.logger.error({err, payment}, error)
          throw new LoggedError(error)
        }

        if (result.is_confirmed || result.is_failed) {
          payment.pending = false
          await payment.save()
        }

        const lightningLogger = this.logger.child({topic: "payment", protocol: "lightning", transactionType: "payment", onUs: false})

        if (result.is_confirmed) {
          lightningLogger.info({success: true, id: payment.hash, payment}, 'payment has been confirmed')
        }

        if (result.is_failed) {
          try {
            await MainBook.void(payment._journal, "Payment canceled") // JSON.stringify(result.failed
            lightningLogger.info({success: false, id: payment.hash, payment, result}, 'payment has been canceled')
          } catch (err) {
            const error = `error canceling payment entry`
            this.logger.fatal({err, payment, result}, error)
            throw new LoggedError(error)
          }
        }
      }

    })
  }

  async updatePendingInvoice({ hash, expired = false }) {
    let invoice

    try {
      // FIXME we should only be able to look at User invoice, 
      // but might not be a strong problem anyway
      // at least return same error if invoice not from user
      // or invoice doesn't exist. to preserve privacy and prevent DDOS attack.
      invoice = await lnService.getInvoice({ lnd: this.lnd, id: hash })

      // TODO: we should not log/keep secret in the logs
      this.logger.info({invoice, uid: this.uid}, "got invoice status")
    } catch (err) {
      const error = `issue fetching invoice`
      this.logger.error({err, invoice}, error)
      throw new LoggedError(error)
    }

    // invoice that are on_us will be cancelled but not confirmed
    // so we need a branch to return true in case the payment 
    // has been managed off lnd.
    if (invoice.is_canceled) {

      const resultDeletion = await InvoiceUser.deleteOne({ _id: hash, uid: this.uid })
      this.logger.info({hash, uid: this.uid, resultDeletion}, "succesfully deleted cancelled invoice")

      // TODO: proper testing
      const result = await Transaction.findOne({currency: this.currency, hash, type: "on_us", pending: false})
      return !!result

    } else if (invoice.is_confirmed) {

      try {

        return await using(disposer(hash), async (lock) => {

          const invoiceUser = await InvoiceUser.findOne({ _id: hash, uid: this.uid })

          if (!invoiceUser) {
            this.logger.info({hash, uid: this.uid}, "invoice has already been processed")
            return true
          }

          // TODO: use a transaction here
          // const session = await InvoiceUser.startSession()
          // session.withTransaction(

          // OR: use a an unique index account / hash / voided
          // may still not avoid issue from discrenpency between hash and the books

          const resultDeletion = await InvoiceUser.deleteOne({ _id: hash, uid: this.uid })
          this.logger.info({hash, uid: this.uid, resultDeletion}, "confirmed invoice has been deleted")

          const sats = invoice.received
          
          const usd = invoiceUser.usd
          const metadata = { hash, type: "invoice", ...this.getCurrencyEquivalent({usd, sats, fee: 0}) }

          // TODO: brokerLndPath should be cached
          const path = this.isUSD ? await brokerLndPath() : this.accountPath

          const entry = MainBook.entry(invoice.description)
            .debit(path, sats, {...metadata, currency: "BTC"})
            .credit(lightningAccountingPath, sats, {...metadata, currency: "BTC"})
          
          if(this.isUSD) {
            entry
              .debit(this.accountPath, usd, {...metadata, currency: "USD"})
              .credit(brokerPath, usd, {...metadata, currency: "USD"})
          }

          await entry.commit()

          // session.commitTransaction()
          // session.endSession()

          this.logger.info({topic: "payment", protocol: "lightning", transactionType: "receipt", onUs: false, success: true, ...metadata })

          return true
        })

      } catch (err) {
        const error = `issue updating invoice`
        this.logger.error({err, invoice}, error)
        throw new LoggedError(error)
      }
    } else if (expired) {

      // maybe not needed after old invoice has been deleted?

      try {
        await lnService.cancelHodlInvoice({ lnd: this.lnd, id: hash })
        this.logger.info({id: hash, uid: this.uid}, "canceling invoice")

      } catch (err) {
        const error = "error deleting invoice"
        this.logger.error({err, error, hash, uid: this.uid}, error)
      }

      const resultDeletion = await InvoiceUser.deleteOne({ _id: hash, uid: this.uid })
      this.logger.info({hash, uid: this.uid, resultDeletion}, "succesfully deleted expired invoice")

    }

    return false
  }

  // should be run regularly with a cronjob
  // TODO: move to an "admin/ops" wallet
  async updatePendingInvoices() {

    const invoices = await InvoiceUser.find({ uid: this.uid })

    for (const invoice of invoices) {
      const { _id, timestamp } = invoice

      // FIXME
      // adding a buffer on the expiration timeline before which we delete the invoice 
      // because it seems lnd still can accept invoice even if they have expired
      // see more: https://github.com/lightningnetwork/lnd/pull/3694
      const additional_delay_value = 1
      const additional_delay_unit = "hours"
      
      const expired = moment() > this.getExpiration(moment(timestamp)
        .add(additional_delay_value, additional_delay_unit)
      )
      await this.updatePendingInvoice({ hash: _id, expired })
    }
  }

}
