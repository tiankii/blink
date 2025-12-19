"use server"

import { getClient } from "../../app/graphql-rsc"

import {
  NotificationTemplatesDocument,
  NotificationTemplatesQuery,
  NotificationTemplatesQueryVariables,
  NotificationByTemplateIdDocument,
  NotificationByTemplateIdQuery,
  NotificationByTemplateIdQueryVariables,
  NotificationTemplateDeleteDocument,
  NotificationTemplateDeleteMutation,
  NotificationTemplateDeleteMutationVariables,
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

export const getTemplateById = async (idReq: string) => {
  console.warn("Get Template")

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
  console.warn("Delete Template")

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
