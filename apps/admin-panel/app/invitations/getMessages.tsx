"use server"

import { getClient } from "../../app/graphql-rsc"

import {
  NotificationMessagesDocument,
  NotificationMessagesQuery,
  NotificationMessagesQueryVariables,
  NotificationMessageUpdateStatusMutation,
  NotificationMessageUpdateStatusMutationVariables,
  NotificationMessageUpdateStatusDocument,
  NotificationMessageUpdateStatusInput,
} from "../../generated"

export const getInvitations = async (
  usernameReq?: string,
): Promise<NotificationMessagesQuery> => {
  console.warn("Get invitations")

  const { data } = await getClient().query<
    NotificationMessagesQuery,
    NotificationMessagesQueryVariables
  >({
    query: NotificationMessagesDocument,
    variables: {
      username: usernameReq,
    },
  })

  return data
}

export const changeInvitationStatus = async (
  data: NotificationMessageUpdateStatusInput,
) => {
  console.warn("Change Status")

  await getClient().mutate<
    NotificationMessageUpdateStatusMutation,
    NotificationMessageUpdateStatusMutationVariables
  >({
    mutation: NotificationMessageUpdateStatusDocument,
    variables: {
      input: {
        id: data.id,
        status: data.status,
      },
    },
  })

  return data
}
