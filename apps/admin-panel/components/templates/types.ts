import { NotificationAction } from "../notification/types"
import {
  DeepLinkActionTemplate,
  DeepLinkScreenTemplate,
  NotificationTemplateCreateInput,
} from "../../generated"

export type TemplateFormState = NotificationTemplateCreateInput & {
  action?: NotificationAction
  deeplinkScreen?: DeepLinkScreenTemplate
  deeplinkAction?: DeepLinkActionTemplate
  externalUrl?: string
}

export type TemplateBuilderProps = {
  formState: TemplateFormState
  updateFormField: <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => void
}

export type CreateTemplateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: NotificationTemplateCreateInput) => Promise<void>
  isLoading: boolean
  editTemplateData?: NotificationTemplateCreateInput
}
