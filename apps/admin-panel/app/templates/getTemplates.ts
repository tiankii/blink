"use server"

import { getClient } from "../../app/graphql-rsc"

import {
  NotificationTemplatesDocument,
  NotificationTemplatesQuery,
  NotificationTemplatesQueryVariables,
} from "../../generated"

export const getTemplates = async (): Promise<NotificationTemplatesQuery> => {
  console.warn("Get Templates")

  const { data } = await getClient().query<
    NotificationTemplatesQuery,
    NotificationTemplatesQueryVariables
  >({
    query: NotificationTemplatesDocument,
  })

  return data
}
