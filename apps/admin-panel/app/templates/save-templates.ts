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

import { normalizeTemplateInput } from "./helpers"

export const saveTemplate = async (data: NotificationTemplateCreateInput) => {
  await getClient().mutate<
    NotificationTemplateCreateMutation,
    NotificationTemplateCreateMutationVariables
  >({
    mutation: NotificationTemplateCreateDocument,
    variables: {
      input: normalizeTemplateInput(data),
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
      input: normalizeTemplateInput(data),
    },
  })
}
