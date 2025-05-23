import {
  TWILIO_ACCOUNT_SID,
  UNSECURE_DEFAULT_LOGIN_CODE,
  getGeetestConfig,
  getTestAccounts,
} from "@/config"
import { ChannelType, checkedToChannel } from "@/domain/phone-provider"
import { TestAccountsChecker } from "@/domain/accounts/test-accounts-checker"
import { PhoneAlreadyExistsError } from "@/domain/authentication/errors"
import { InvalidChannel, NotImplementedError } from "@/domain/errors"
import { RateLimitConfig } from "@/domain/rate-limit"
import { RateLimiterExceededError } from "@/domain/rate-limit/errors"
import Geetest from "@/services/geetest"
import { AuthWithEmailPasswordlessService } from "@/services/kratos"
import { baseLogger } from "@/services/logger"
import { UsersRepository } from "@/services/mongoose"
import { consumeLimiter } from "@/services/rate-limit"
import { TWILIO_ACCOUNT_TEST, TwilioClient } from "@/services/twilio-service"

export const requestPhoneCodeWithCaptcha = async ({
  phone,
  geetestChallenge,
  geetestValidate,
  geetestSeccode,
  ip,
  channel,
}: {
  phone: PhoneNumber
  geetestChallenge: string
  geetestValidate: string
  geetestSeccode: string
  ip: IpAddress
  channel: string
}): Promise<true | ApplicationError> => {
  const geeTestConfig = getGeetestConfig()
  const geetest = Geetest(geeTestConfig)

  const verifySuccess = await geetest.validate(
    geetestChallenge,
    geetestValidate,
    geetestSeccode,
  )
  if (verifySuccess instanceof Error) return verifySuccess

  {
    const limitOk = await checkRequestCodeAttemptPerIpLimits(ip)
    if (limitOk instanceof Error) return limitOk
  }

  {
    const limitOk = await checkRequestCodeAttemptPerPhoneNumberLimits(phone)
    if (limitOk instanceof Error) return limitOk
  }

  if (UNSECURE_DEFAULT_LOGIN_CODE) {
    return true
  }

  if (TWILIO_ACCOUNT_SID === TWILIO_ACCOUNT_TEST) {
    return new NotImplementedError()
  }

  const testAccounts = getTestAccounts()
  if (TestAccountsChecker(testAccounts).isPhoneTest(phone)) {
    return true
  }

  const user = await UsersRepository().findByPhone(phone)
  const phoneExists = !(user instanceof Error)

  const checkedChannel = checkedToChannel(phone, channel)
  if (checkedChannel instanceof Error) return checkedChannel

  if (`${checkedChannel}` === ChannelType.Telegram) {
    return new InvalidChannel(channel)
  }

  return TwilioClient().initiateVerify({
    to: phone,
    channel: checkedChannel,
    phoneExists,
  })
}

export const requestPhoneCodeForAuthedUser = async ({
  phone,
  ip,
  channel,
  user,
}: {
  phone: PhoneNumber
  ip: IpAddress
  channel: string
  user: User
}): Promise<true | PhoneProviderServiceError> => {
  {
    const limitOk = await checkRequestCodeAttemptPerIpLimits(ip)
    if (limitOk instanceof Error) return limitOk
  }

  {
    const limitOk = await checkRequestCodeAttemptPerPhoneNumberLimits(phone)
    if (limitOk instanceof Error) return limitOk
  }

  if (user.phone) {
    return new PhoneAlreadyExistsError()
  }

  if (UNSECURE_DEFAULT_LOGIN_CODE) {
    return true
  }

  if (TWILIO_ACCOUNT_SID === TWILIO_ACCOUNT_TEST) {
    return new NotImplementedError()
  }

  const testAccounts = getTestAccounts()
  if (TestAccountsChecker(testAccounts).isPhoneTest(phone)) {
    return true
  }

  const checkedChannel = checkedToChannel(phone, channel)
  if (checkedChannel instanceof Error) return checkedChannel

  if (`${checkedChannel}` === ChannelType.Telegram) {
    return new InvalidChannel(channel)
  }

  return TwilioClient().initiateVerify({
    to: phone,
    channel: checkedChannel,
    phoneExists: false,
  })
}

export const requestPhoneCodeWithAppcheckJti = async ({
  phone,
  ip,
  channel,
  appcheckJti,
}: {
  phone: PhoneNumber
  ip: IpAddress
  channel: string
  appcheckJti: string
}): Promise<true | PhoneProviderServiceError> => {
  {
    const limitOk = await checkRequestCodeAttemptPerIpLimits(ip)
    if (limitOk instanceof Error) return limitOk
  }

  {
    const limitOk = await checkRequestCodeAttemptPerPhoneNumberLimits(phone)
    if (limitOk instanceof Error) return limitOk
  }

  {
    const limitOk = await checkRequestCodeAttemptPerAppcheckJtiLimits(
      appcheckJti as AppcheckJti,
    )
    if (limitOk instanceof Error) return limitOk
  }

  if (UNSECURE_DEFAULT_LOGIN_CODE) {
    return true
  }

  if (TWILIO_ACCOUNT_SID === TWILIO_ACCOUNT_TEST) {
    return new NotImplementedError()
  }

  const testAccounts = getTestAccounts()
  if (TestAccountsChecker(testAccounts).isPhoneTest(phone)) {
    return true
  }

  const user = await UsersRepository().findByPhone(phone)
  const phoneExists = !(user instanceof Error)

  const checkedChannel = checkedToChannel(phone, channel)
  if (checkedChannel instanceof Error) return checkedChannel

  if (`${checkedChannel}` === ChannelType.Telegram) {
    return new InvalidChannel(channel)
  }

  return TwilioClient().initiateVerify({
    to: phone,
    channel: checkedChannel,
    phoneExists,
  })
}

export const requestEmailCode = async ({
  email,
  ip,
}: {
  email: EmailAddress
  ip: IpAddress
}): Promise<EmailLoginId | EmailRegistrationId | KratosError> => {
  baseLogger.info({ email, ip }, "RequestEmailCode called")

  {
    const limitOk = await checkRequestCodeAttemptPerIpLimits(ip)
    if (limitOk instanceof Error) return limitOk
  }

  {
    const limitOk = await checkRequestCodeAttemptPerLoginIdentifierLimits(email)
    if (limitOk instanceof Error) return limitOk
  }

  const authServiceEmail = AuthWithEmailPasswordlessService()
  const flow = await authServiceEmail.sendEmailWithCode({ email })
  if (flow instanceof Error) return flow

  return flow
}

const checkRequestCodeAttemptPerIpLimits = async (
  ip: IpAddress,
): Promise<true | RateLimiterExceededError> =>
  consumeLimiter({
    rateLimitConfig: RateLimitConfig.requestCodeAttemptPerIp,
    keyToConsume: ip,
  })

const checkRequestCodeAttemptPerPhoneNumberLimits = async (
  phoneNumber: PhoneNumber,
): Promise<true | RateLimiterExceededError> =>
  consumeLimiter({
    rateLimitConfig: RateLimitConfig.requestCodeAttemptPerPhoneNumber,
    keyToConsume: phoneNumber,
  })

const checkRequestCodeAttemptPerLoginIdentifierLimits = async (
  email: EmailAddress,
): Promise<true | RateLimiterExceededError> =>
  consumeLimiter({
    rateLimitConfig: RateLimitConfig.requestCodeAttemptPerEmail,
    keyToConsume: email,
  })

const checkRequestCodeAttemptPerAppcheckJtiLimits = async (
  appcheckJti: AppcheckJti,
): Promise<true | RateLimiterExceededError> =>
  consumeLimiter({
    rateLimitConfig: RateLimitConfig.requestCodeAttemptPerAppcheckJti,
    keyToConsume: appcheckJti,
  })
