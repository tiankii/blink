"use server"

import { getClient } from "../../app/graphql-rsc"

import {
  NotificationTemplateCreateMutation,
  NotificationTemplateCreateMutationVariables,
  NotificationTemplateCreateDocument,
  NotificationTemplateCreateInput,
} from "../../generated"

export const saveTemplate = async (data: NotificationTemplateCreateInput) => {
  await getClient().mutate<
    NotificationTemplateCreateMutation,
    NotificationTemplateCreateMutationVariables
  >({
    mutation: NotificationTemplateCreateDocument,
    variables: {
      input: {
        body: data.body,
        iconName: data.iconName,
        languageCode: data.languageCode,
        name: data.name,
        shouldAddToBulletin: data.shouldAddToBulletin,
        shouldAddToHistory: data.shouldAddToHistory,
        shouldSendPush: data.shouldSendPush,
        title: data.title,
      },
    },
  })
}
