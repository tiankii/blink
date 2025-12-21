"use server"

import { getClient } from "@/app/graphql-rsc"
import {
  NotificationByTemplateIdDocument,
  NotificationByTemplateIdQuery,
  NotificationByTemplateIdQueryVariables,
  NotificationTemplateDeleteDocument,
  NotificationTemplateDeleteMutation,
  NotificationTemplateDeleteMutationVariables,
  NotificationTemplatesDocument,
  NotificationTemplatesQuery,
  NotificationTemplatesQueryVariables,
} from "@/generated"

export const getTemplates = async (): Promise<NotificationTemplatesQuery> => {
  const { data } = await getClient().query<
    NotificationTemplatesQuery,
    NotificationTemplatesQueryVariables
  >({
    query: NotificationTemplatesDocument,
  })

  return data
}

export const getTemplateById = async (idReq: string) => {
  const { data } = await getClient().query<
    NotificationByTemplateIdQuery,
    NotificationByTemplateIdQueryVariables
  >({
    query: NotificationByTemplateIdDocument,
    variables: { id: idReq },
  })

  return data
}

export const deleteTemplate = async (idReq: string) => {
  await getClient().mutate<
    NotificationTemplateDeleteMutation,
    NotificationTemplateDeleteMutationVariables
  >({
    mutation: NotificationTemplateDeleteDocument,
    variables: {
      input: {
        id: idReq,
      },
    },
  })
}
