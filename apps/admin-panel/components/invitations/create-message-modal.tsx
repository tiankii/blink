import { useState, useMemo } from "react"

import { Button } from "../shared/button"
import { TextInput, SelectInput, TextArea, Checkbox } from "../shared/form-controls"
import { FormStateMessage, SubmitState, TemplateRow } from "../../app/invitations/types"

type CreateMessageModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormStateMessage) => Promise<void>
  isLoading: boolean
  templates: TemplateRow[]
  submitState: SubmitState
}

export function CreateMessageModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  templates,
  submitState,
}: CreateMessageModalProps) {
  const [formState, setFormState] = useState<FormStateMessage>({
    userQuery: "",
    templateId: "",
    title: "",
    body: "",
    sendPush: true,
    addHistory: true,
    addBulletin: true,
  })

  const canSend = useMemo(
    () => Boolean(formState.userQuery.trim() && formState.templateId),
    [formState.userQuery, formState.templateId],
  )

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === formState.templateId),
    [templates, formState.templateId],
  )

  const invitationTemplate = useMemo(() => {
    if (!selectedTemplate) return undefined
    return {
      ...selectedTemplate,
      localizedNotificationContents: [
        {
          title: formState.title,
          body: formState.body,
          language: "en",
        },
      ],
      shouldSendPush: formState.sendPush,
      shouldAddToHistory: formState.addHistory,
      shouldAddToBulletin: formState.addBulletin,
    }
  }, [
    selectedTemplate,
    formState.title,
    formState.body,
    formState.sendPush,
    formState.addHistory,
    formState.addBulletin,
  ])

  const updateFormField = <K extends keyof FormStateMessage>(
    key: K,
    value: FormStateMessage[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSend) return

    await onSubmit(formState)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 p-0">
      <div className="w-full h-full overflow-auto border-b border-gray-100 bg-white px-8 py-5">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Send Invitation</h1>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Invite User</h2>
              <div className="relative">
                <TextInput
                  id="user-search"
                  type="text"
                  placeholder="Search or add a username or email"
                  value={formState.userQuery}
                  onChange={(event) => updateFormField("userQuery", event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Template</h2>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="template"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Choose template
                </label>
                <SelectInput
                  id="template"
                  value={formState.templateId}
                  onChange={(event) => updateFormField("templateId", event.target.value)}
                >
                  <option value="">Select a template</option>
                  {templates && templates.length > 0 ? (
                    templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} ({template.language})
                      </option>
                    ))
                  ) : (
                    <option value="">There are no templates</option>
                  )}
                </SelectInput>
              </div>
              {formState.templateId && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <TextInput
                      id="title"
                      type="text"
                      value={formState.title}
                      onChange={(event) => updateFormField("title", event.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="body"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Content
                    </label>
                    <TextArea
                      id="body"
                      rows={4}
                      value={formState.body}
                      onChange={(event) => updateFormField("body", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1 text-sm text-gray-800">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={formState.sendPush}
                        onChange={(event) =>
                          updateFormField("sendPush", event.target.checked)
                        }
                      />
                      <span>Send Push Notification</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={formState.addHistory}
                        onChange={(event) =>
                          updateFormField("addHistory", event.target.checked)
                        }
                      />
                      <span>Add to History</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={formState.addBulletin}
                        onChange={(event) =>
                          updateFormField("addBulletin", event.target.checked)
                        }
                      />
                      <span>Add to Bulletin</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={!canSend || isLoading}
                className="rounded-md bg-orange-500 px-4 py-2 text-white"
              >
                <span className="mr-2">➤</span>
                <span>Send Invite</span>
                {isLoading ? "Sending Invite..." : "Send Invite"}
              </Button>
            </div>
            {submitState.loading && <p>Sending...</p>}
            {submitState.error && <p className="text-red-500">{submitState.error}</p>}
            {submitState.success && (
              <p className="text-green-500">Notification sent successfully</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
