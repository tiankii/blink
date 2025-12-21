import {
  NotificationTemplateCreateInput,
  NotificationTemplateUpdateInput,
} from "@/generated"

import { sanitizeStringOrNull } from "@/app/utils"

type TemplateInput = NotificationTemplateCreateInput | NotificationTemplateUpdateInput

export const normalizeTemplateInput = <T extends TemplateInput>(data: T): T => {
  const deeplinkScreen = sanitizeStringOrNull(data.deeplinkScreen as string | null)
  const deeplinkAction = sanitizeStringOrNull(data.deeplinkAction as string | null)
  const externalUrl = sanitizeStringOrNull(data.externalUrl ?? null)

  const hasDeeplink = deeplinkScreen !== null
  const hasExternalUrl = externalUrl !== null

  return {
    ...data,
    deeplinkScreen: hasDeeplink && !hasExternalUrl ? deeplinkScreen : null,
    deeplinkAction: hasDeeplink && !hasExternalUrl ? deeplinkAction : null,
    externalUrl: hasExternalUrl && !hasDeeplink ? externalUrl : null,
  }
}
