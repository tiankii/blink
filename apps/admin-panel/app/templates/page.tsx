"use client"

import { useState, useCallback, useEffect, useMemo, startTransition } from "react"
import { useRouter } from "next/navigation"

import { visaTemplatesMock } from "../mock-data"
import { Button } from "../../components/shared/button"
import { Pagination } from "../../components/shared/pagination"
import { TemplateIcon, TemplateRow } from "../invitations/types"
import { getTemplates } from "./getTemplates"
import { saveTemplate } from "./save-templates"
import {
  NotificationTemplatesQuery,
  NotificationTemplateCreateInput,
} from "../../generated"

import { CreateTemplateModal } from "../../components/templates/create-template-modal"

type SubmitState = {
  loadingCreate: boolean
  success: boolean
  error?: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [pageItems, setPageItems] = useState<TemplateRow[]>(visaTemplatesMock.slice(0, 0))
  const [data, setData] = useState<NotificationTemplatesQuery | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [submitState, setSubmitState] = useState<SubmitState>({
    loadingCreate: false,
    success: false,
    error: undefined,
  })

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates()
      setData(data)
    } catch (error) {
      console.error("Error fetching templates", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()

    if (isCreateOpen) {
      document.body.classList.add("hide-sidebar")
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.classList.remove("hide-sidebar")
        document.body.style.overflow = prev || ""
      }
    }
    return
  }, [isCreateOpen])

  const handleCreateTemplate = async (formData: NotificationTemplateCreateInput) => {
    setSubmitState({ loadingCreate: true, success: false, error: undefined })

    try {
      await saveTemplate(formData)
      setSubmitState((prev) => ({ ...prev, success: true }))
      await fetchTemplates()
      setIsCreateOpen(false)
    } catch (error) {
      setSubmitState((prev) => ({ ...prev, error: "Error creating template." }))
      console.error(submitState.error)
    } finally {
      setSubmitState((prev) => ({ ...prev, loadingCreate: false }))
    }
  }

  const templates: TemplateRow[] = useMemo(() => {
    if (!data?.notificationTemplates) return []

    return data.notificationTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      language: template.languageCode,
      icon: template.iconName,
      title: template.title,
      body: template.body,
      sendPush: template.shouldSendPush,
      addHistory: template.shouldAddToHistory,
      addBulletin: template.shouldAddToBulletin,
    }))
  }, [data])

  const handleRowClick = useCallback(
    (id: string) => {
      startTransition(() => {
        router.push(`/templates/${id}/edit`)
      })
    },
    [router],
  )

  const handlePageChange = useCallback(
    ({ offset, limit }: { offset: number; limit: number }) => {
      setPageItems(templates.slice(offset, offset + limit))
    },
    [templates],
  )

  const hasTemplates = pageItems.length > 0

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg text-gray-500">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <span className="mr-2">＋</span>
          <span>Create New Template</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Language</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Icon</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Content</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {hasTemplates ? (
              pageItems.map((template) => (
                <tr
                  key={template.id}
                  onClick={() => handleRowClick(template.id)}
                  className="hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{template.language}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {template.icon === TemplateIcon.Star ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-yellow-500">
                        ★
                      </span>
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-green-600">
                        ✓
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{template.title}</div>
                      <div className="mt-1 text-gray-600">{template.body}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline-blue"
                        onClick={() => router.push(`/templates/${template.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button variant="outline-red">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No templates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination totalItems={visaTemplatesMock.length} onPageChange={handlePageChange} />

      {isCreateOpen && (
        <CreateTemplateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateTemplate}
          isLoading={submitState.loadingCreate}
        />
      )}
    </div>
  )
}
