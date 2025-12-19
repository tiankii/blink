"use server"
import { getClient } from "../../graphql-rsc"

import {
  NotificationMessageHistoryDocument,
  NotificationMessageHistoryQuery,
  NotificationMessageHistoryQueryVariables,
} from "../../../generated"

export const getHistory = async (
  idReq: string,
): Promise<NotificationMessageHistoryQuery> => {
  console.warn("Get History")

  const { data } = await getClient().query<
    NotificationMessageHistoryQuery,
    NotificationMessageHistoryQueryVariables
  >({
    query: NotificationMessageHistoryDocument,
    variables: {
      id: idReq,
    },
  })

  return data
}
