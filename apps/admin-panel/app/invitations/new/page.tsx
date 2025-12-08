"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

import { visaTemplatesMock } from "../../mock-data"
import { Button } from "../../../components/shared/button"
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

  const selectedTemplate = useMemo(
    () => visaTemplatesMock.find((template) => template.id === templateId),
    [templateId],
  )

  useEffect(() => {
    if (!selectedTemplate) {
      setTitle("")
      setBody("")
      return
    }
    setTitle(selectedTemplate.title)
    setBody(selectedTemplate.body)
  }, [selectedTemplate])

  const canSend = useMemo(
    () => Boolean(userQuery.trim() && templateId),
    [userQuery, templateId],
  )

  const handleSend = useCallback(() => {
    if (!canSend) return

    router.push("/invitations")
  }, [canSend, router])

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
              {visaTemplatesMock.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.language})
                </option>
              ))}
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
          <Button onClick={handleSend} disabled={!canSend}>
            <span className="mr-2">➤</span>
            <span>Send Invite</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
