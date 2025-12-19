import { useState, useMemo } from "react"

import { Button } from "../shared/button"
import { DeepLinkScreen, DeepLinkAction, NotificationIcon } from "../../generated"
import { LanguageCodes } from "../notification/languages"
import { NotificationAction } from "../notification/types"
import { NotificationTemplateCreateInput } from "../../generated"

import { TextInput, SelectInput, TextArea, Checkbox } from "../shared/form-controls"

type CreateTemplateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: NotificationTemplateCreateInput) => Promise<void>
  isLoading: boolean
  editTemplateData?: NotificationTemplateCreateInput
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editTemplateData,
}: CreateTemplateModalProps) {
  const [formState, setFormState] = useState<NotificationTemplateCreateInput>(
    editTemplateData || {
      body: "",
      iconName: "BELL",
      languageCode: LanguageCodes.English,
      name: "",
      shouldAddToBulletin: true,
      shouldAddToHistory: true,
      shouldSendPush: true,
      title: "",
      deeplinkScreen: "",
      notificationAction: "",
    },
  )

  const updateFormField = <K extends keyof NotificationTemplateCreateInput>(
    key: K,
    value: NotificationTemplateCreateInput[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const canSend = useMemo(
    () => Boolean(formState.body && formState.name),
    [formState.body, formState.name],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSend) return

    await onSubmit(formState)

    setFormState({
      body: "",
      iconName: "",
      languageCode: "",
      name: "",
      shouldAddToBulletin: true,
      shouldAddToHistory: true,
      shouldSendPush: true,
      title: "",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 p-0">
      <div className="w-full h-full overflow-auto border-b border-gray-100 bg-white px-8 py-5">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {" "}
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
            <div className="mt-2 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Template Name
                </label>
                <TextInput
                  id="name"
                  type="text"
                  placeholder="e.g., Weekly Digest"
                  value={formState.name}
                  onChange={(event) => updateFormField("name", event.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Action
                  </label>
                  <SelectInput
                    id="notificationAction"
                    value={formState.notificationAction || ""}
                    onChange={(event) =>
                      updateFormField("notificationAction", event.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    <option value="">None</option>
                    {Object.values(NotificationAction).map((actionIcon) => {
                      return (
                        <option key={actionIcon} value={actionIcon}>
                          {actionIcon}
                        </option>
                      )
                    })}
                  </SelectInput>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deep Link Screen
                  </label>
                  <SelectInput
                    id="deeplinkScreen"
                    value={formState.deeplinkScreen || ""}
                    onChange={(event) =>
                      updateFormField("deeplinkScreen", event.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    <option value="">None</option>
                    {Object.values(DeepLinkScreen).map((screen) => {
                      return (
                        <option key={screen} value={screen}>
                          {screen}
                        </option>
                      )
                    })}
                  </SelectInput>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.shouldSendPush}
                    onChange={(event) =>
                      updateFormField("shouldSendPush", event.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">Send Push Notification</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.shouldAddToHistory}
                    onChange={(event) =>
                      updateFormField("shouldAddToHistory", event.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">Add to History</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.shouldAddToBulletin}
                    onChange={(event) =>
                      updateFormField("shouldAddToBulletin", event.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">Add to Bulletin</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <SelectInput
                    id="language"
                    value={formState.languageCode}
                    onChange={(event) =>
                      updateFormField("languageCode", event.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    {Object.entries(LanguageCodes).map(([key, value]) => {
                      return (
                        <option key={key} value={value}>
                          {key}
                        </option>
                      )
                    })}
                  </SelectInput>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Icon</label>
                  <SelectInput
                    id="iconName"
                    value={formState.iconName}
                    onChange={(event) => updateFormField("iconName", event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2"
                  >
                    <option>None</option>
                    {Object.values(NotificationIcon).map((icon) => {
                      return (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      )
                    })}
                  </SelectInput>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <TextInput
                  id="title"
                  type="text"
                  placeholder="Enter title..."
                  value={formState.title}
                  onChange={(event) => updateFormField("title", event.target.value)}
                  aria-label="Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Body</label>
                <TextArea
                  id="body"
                  rows={4}
                  value={formState.body}
                  onChange={(event) => updateFormField("body", event.target.value)}
                  placeholder="Enter body content..."
                />
              </div>

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
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
