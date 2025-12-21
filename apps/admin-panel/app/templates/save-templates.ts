"use server"

import { getClient } from "@/app/graphql-rsc"

import {
  NotificationTemplateCreateMutation,
  NotificationTemplateCreateMutationVariables,
  NotificationTemplateCreateDocument,
  NotificationTemplateCreateInput,
  NotificationTemplateUpdateMutation,
  NotificationTemplateUpdateMutationVariables,
  NotificationTemplateUpdateDocument,
  NotificationTemplateUpdateInput,
} from "@/generated"

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
        deeplinkScreen: data.deeplinkScreen,
        deeplinkAction: data.deeplinkAction,
        externalUrl: data.externalUrl,
      },
    },
  })
}

export const updateTemplate = async (data: NotificationTemplateUpdateInput) => {
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
        deeplinkAction: data.deeplinkAction,
        externalUrl: data.externalUrl,
      },
    },
  })
}
