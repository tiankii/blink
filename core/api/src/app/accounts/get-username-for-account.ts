import { UsernameRepository } from "@/services/mongoose"

export const getUsernameForAccount = async (
  accountId: AccountId,
): Promise<Username | ApplicationError> => {
  const usernamesRepo = UsernameRepository()
  const result = await usernamesRepo.findDefaultByAccountId(accountId)
  if (result instanceof Error) return result
  return result.handle
}
