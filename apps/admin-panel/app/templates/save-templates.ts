"use server"

import { getClient } from "../../app/graphql-rsc"

import {
  NotificationTemplateCreateMutation,
  NotificationTemplateCreateMutationVariables,
  NotificationTemplateCreateDocument,
  NotificationTemplateCreateInput,
  NotificationTemplateUpdateMutation,
  NotificationTemplateUpdateMutationVariables,
  NotificationTemplateUpdateDocument,
  NotificationTemplateUpdateInput,
  NotificationMessageCreateMutation,
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

export const updateTemplate = async (data: NotificationTemplateUpdateInput) => {
  console.warn("Update Template")

  await getClient().mutate<
    NotificationTemplateUpdateMutation,
    NotificationTemplateUpdateMutationVariables
  >({
    mutation: NotificationTemplateUpdateDocument,
    variables: {
      input: {
        id: data.id,
        name: data.name,
        languageCode: data.languageCode,
        title: data.title,
        body: data.body,
        iconName: data.iconName,
        shouldSendPush: data.shouldSendPush,
        shouldAddToHistory: data.shouldAddToHistory,
        shouldAddToBulletin: data.shouldAddToBulletin,
        deeplinkScreen: data.deeplinkScreen,
        notificationAction: data.notificationAction,
      },
    },
  })
}
