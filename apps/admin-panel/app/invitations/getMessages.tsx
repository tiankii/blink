"use server"

import { getClient } from "../../app/graphql-rsc"

import {
  NotificationMessagesDocument,
  NotificationMessagesQuery,
  NotificationMessagesQueryVariables,
} from "../../generated"

export const getInvitations = async (): Promise<NotificationMessagesQuery> => {
  console.warn("Get invitations")

  const { data } = await getClient().query<
    NotificationMessagesQuery,
    NotificationMessagesQueryVariables
  >({
    query: NotificationMessagesDocument,
  })

  return data
}
