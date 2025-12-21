import { useEffect, useMemo, useState } from "react"

import { TemplateBuilder } from "./template-builder"
import { TemplateCreateEditModalProps, TemplateFormState } from "./types"

import { sanitizeStringOrNull } from "@/app/utils"
import { NotificationTemplateCreateInput } from "@/generated"

import { Button } from "@/components/shared/button"
import { NotificationAction } from "@/components/notification/types"
import { LanguageCodes } from "@/components/notification/languages"

const INITIAL_FORM_STATE: TemplateFormState = {
  name: "",
  shouldSendPush: true,
  shouldAddToHistory: true,
  shouldAddToBulletin: true,
  languageCode: LanguageCodes.English,
  iconName: "BELL",
  title: "",
  body: "",
}

export function TemplateCreateEditModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editTemplateData,
}: TemplateCreateEditModalProps) {
  const [formState, setFormState] = useState<TemplateFormState>(() => {
    if (!editTemplateData) return INITIAL_FORM_STATE

    return {
      ...INITIAL_FORM_STATE,
      ...editTemplateData,
      deeplinkScreen:
        editTemplateData.deeplinkScreen ?? INITIAL_FORM_STATE.deeplinkScreen,
      deeplinkAction:
        editTemplateData.deeplinkAction ?? INITIAL_FORM_STATE.deeplinkAction,
      externalUrl: editTemplateData.externalUrl ?? INITIAL_FORM_STATE.externalUrl,
    }
  })

  useEffect(() => {
    if (!isOpen) return
    if (!editTemplateData) {
      setFormState(INITIAL_FORM_STATE)
      return
    }

    setFormState({
      ...INITIAL_FORM_STATE,
      ...editTemplateData,
      deeplinkScreen:
        editTemplateData.deeplinkScreen ?? INITIAL_FORM_STATE.deeplinkScreen,
      deeplinkAction:
        editTemplateData.deeplinkAction ?? INITIAL_FORM_STATE.deeplinkAction,
      externalUrl: editTemplateData.externalUrl ?? INITIAL_FORM_STATE.externalUrl,
    })
  }, [isOpen, editTemplateData])

  const updateFormField = <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const canSend = useMemo(() => {
    if (!formState.name || !formState.body || !formState.action) {
      return false
    }

    if (formState.action === NotificationAction.OpenExternalUrl) {
      return sanitizeStringOrNull(formState.externalUrl ?? null) !== null
    }

    if (formState.action === NotificationAction.OpenDeepLink) {
      return Boolean(formState.deeplinkScreen)
    }

    return true
  }, [formState])

  const buildPayload = (): NotificationTemplateCreateInput => {
    const base: NotificationTemplateCreateInput = {
      name: formState.name,
      title: formState.title,
      body: formState.body,
      iconName: formState.iconName,
      languageCode: formState.languageCode,
      shouldAddToBulletin: formState.shouldAddToBulletin,
      shouldAddToHistory: formState.shouldAddToHistory,
      shouldSendPush: formState.shouldSendPush,
    }

    if (formState.action === NotificationAction.OpenDeepLink) {
      return {
        ...base,
        deeplinkScreen: formState.deeplinkScreen,
        deeplinkAction: formState.deeplinkAction,
      }
    }

    if (formState.action === NotificationAction.OpenExternalUrl) {
      const sanitizedUrl = sanitizeStringOrNull(formState.externalUrl ?? null)
      return {
        ...base,
        externalUrl: sanitizedUrl ?? "",
      }
    }

    return base
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return

    const payload = buildPayload()
    await onSubmit(payload)

    setFormState(INITIAL_FORM_STATE)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 p-0">
      <div className="w-full h-full overflow-auto border-b border-gray-100 bg-white px-8 py-5">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {editTemplateData ? "Edit Template" : "Create New Template"}
          </h1>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        <div className="mx-auto max-w-6xl p-5">
          <form onSubmit={handleSubmit}>
            <TemplateBuilder formState={formState} updateFormField={updateFormField} />

            <div className="mt-6 flex items-center gap-4">
              <Button
                type="submit"
                disabled={!canSend || isLoading}
                className="rounded-md bg-orange-500 px-4 py-2 text-white"
              >
                {isLoading
                  ? "Saving..."
                  : editTemplateData
                    ? "Update Template"
                    : "Save Template"}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
