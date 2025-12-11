"use server"
import { getClient } from "../../graphql-rsc"

import {
  AccountDetailsByAccountIdDocument,
  AccountDetailsByAccountIdQuery,
  AccountDetailsByAccountIdQueryVariables,
} from "../../../generated"
import { AuditedAccountMainValues } from "../../types"

export const accountSearchInvitation = async (
  userInvitationId: string,
): Promise<AuditedAccountMainValues> => {
  const { data } = await getClient().query<
    AccountDetailsByAccountIdQuery,
    AccountDetailsByAccountIdQueryVariables
  >({
    query: AccountDetailsByAccountIdDocument,
    variables: { accountId: userInvitationId },
  })

  return data.accountDetailsByAccountId
}
