"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

import { DeepLinkScreen, DeepLinkAction, NotificationIcon } from "../../../generated"
import { notificationContentMock, InvitationContent } from "../../mock-data"
import { Button } from "../../../components/shared/button"
import {
  userIdByUsername,
  triggerMarketingNotification,
} from "../../../components/notification/notification-actions"

import {
  TextInput,
  SelectInput,
  TextArea,
  Checkbox,
} from "../../../components/shared/form-controls"

export default function NewInvitationPage() {
  const router = useRouter()
  const [userQuery, setUserQuery] = useState("")
  const [templateId, setTemplateId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [sendPush, setSendPush] = useState(true)
  const [addHistory, setAddHistory] = useState(true)
  const [addBulletin, setAddBulletin] = useState(true)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const selectedTemplate = useMemo(
    () => notificationContentMock.find((template) => template.id === templateId),
    [templateId],
  )

  const invitationTemplate = useMemo(
    () =>
      selectedTemplate
        ? {
            ...selectedTemplate,
            localizedNotificationContents: [
              {
                ...selectedTemplate.localizedNotificationContents[0],
                title,
                body,
              },
            ],
            shouldSendPush: sendPush,
            shouldAddToHistory: addHistory,
            shouldAddToBulletin: addBulletin,
          }
        : undefined,
    [selectedTemplate, title, body, sendPush, addHistory, addBulletin],
  )

  console.log("Selected Template:", selectedTemplate)
  console.log("Modified Template (temporary):", invitationTemplate)

  useEffect(() => {
    if (!selectedTemplate) {
      setTitle("")
      setBody("")
      return
    }
    const firstContent = selectedTemplate.localizedNotificationContents[0]
    setTitle(firstContent?.title || "")
    setBody(firstContent?.body || "")
    setSendPush(selectedTemplate.shouldSendPush)
    setAddHistory(selectedTemplate.shouldAddToHistory)
    setAddBulletin(selectedTemplate.shouldAddToBulletin)
  }, [selectedTemplate])

  const canSend = useMemo(
    () => Boolean(userQuery.trim() && templateId),
    [userQuery, templateId],
  )
  console.log("Can Send Invitation:", canSend)

  const InvitationSender = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(undefined)

    console.log("Entró aquí")
    const userIdRes = await userIdByUsername(userQuery.trim())

    if (userIdRes.userId === undefined) {
      setLoading(false)
      setError(userIdRes.message || "User not found.")
      return
    }

    if (!invitationTemplate) {
      setLoading(false)
      setError("Invitation template is not selected.")
      return
    }

    const res = await triggerMarketingNotification({
      userIdsFilter: [userIdRes.userId],
      openDeepLink: invitationTemplate.openDeepLink,
      openExternalUrl: invitationTemplate.openExternalUrl,
      icon: invitationTemplate.icon,
      shouldSendPush: invitationTemplate.shouldSendPush,
      shouldAddToBulletin: invitationTemplate.shouldAddToBulletin,
      shouldAddToHistory: invitationTemplate.shouldAddToHistory,
      localizedNotificationContents: invitationTemplate.localizedNotificationContents,
    })
    setLoading(false)

    if (res.success) {
      setSuccess(true)
      return
    } else {
      setError(res.message || "Failed to send invitation.")
    }
  }

  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Send Invitation</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          ✕
        </button>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Invite User</h2>
          <div className="relative">
            <TextInput
              id="user-search"
              type="text"
              placeholder="Search or add a username or email"
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
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
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
            >
              <option value="">Select a template</option>
              {notificationContentMock.map((template) => {
                const firstContent = template.localizedNotificationContents[0]
                return (
                  <option key={template.id} value={template.id}>
                    {firstContent?.title} ({firstContent?.language})
                  </option>
                )
              })}
            </SelectInput>
          </div>
          {templateId && (
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
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-4 pt-1 text-sm text-gray-800">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={sendPush}
                    onChange={(event) => setSendPush(event.target.checked)}
                  />
                  <span>Send Push Notification</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={addHistory}
                    onChange={(event) => setAddHistory(event.target.checked)}
                  />
                  <span>Add to History</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={addBulletin}
                    onChange={(event) => setAddBulletin(event.target.checked)}
                  />
                  <span>Add to Bulletin</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-start">
          <Button onClick={InvitationSender} disabled={!canSend}>
            <span className="mr-2">➤</span>
            <span>Send Invite</span>
          </Button>
          {loading && <p>Sending...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">Notification sent successfully</p>}
        </div>
      </div>
    </div>
  )
}
