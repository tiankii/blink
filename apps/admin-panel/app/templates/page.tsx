"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { saveTemplate, updateTemplate } from "./save-templates"
import { deleteTemplate, getTemplateById, getTemplates } from "./getTemplates"

import { sanitizeStringOrNull } from "@/app/utils"
import { visaTemplatesMock } from "@/app/mock-data"
import { TemplateRow } from "@/app/invitations/types"

import { Button } from "@/components/shared/button"
import { Pagination } from "@/components/shared/pagination"
import { NotificationAction } from "@/components/notification/types"
import { CreateTemplateModal } from "@/components/templates/create-template-modal"
import { NotificationIconComponent } from "@/components/invitations/invitation-icon"
import {
  DeepLinkActionTemplate,
  DeepLinkScreenTemplate,
  NotificationIcon,
  NotificationTemplateCreateInput,
  NotificationTemplatesQuery,
} from "@/generated"

type SubmitState = {
  loadingCreate: boolean
  success: boolean
  error?: string
}

type TemplateWithFields = {
  id: string
  name: string
  title: string
  body: string
  iconName: string
  languageCode: string
  shouldSendPush: boolean
  shouldAddToHistory: boolean
  shouldAddToBulletin: boolean
  deeplinkScreen?: string | null
  deeplinkAction?: string | null
  externalUrl?: string | null
  external_url?: string | null
}

export default function TemplatesPage() {
  const [pageItems, setPageItems] = useState<TemplateRow[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editTemplateData, setEditTemplateData] = useState<{
    id: string
    data: NotificationTemplateCreateInput
  } | null>(null)
  const [data, setData] = useState<NotificationTemplatesQuery>()
  const [loading, setLoading] = useState<boolean>(true)
  const [submitState, setSubmitState] = useState<SubmitState>({
    loadingCreate: false,
    success: false,
  })

  const fetchTemplates = async () => {
    try {
      const dataRes = await getTemplates()
      setData(dataRes)
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
  }, [isCreateOpen])

  const handleGetTemplate = async (idReq: string) => {
    try {
      const res = await getTemplateById(idReq)
      const tpl = res.notificationByTemplateId as TemplateWithFields | null
      if (!tpl) return

      const deeplinkScreen = tpl.deeplinkScreen as DeepLinkScreenTemplate | null
      const deeplinkAction = tpl.deeplinkAction as DeepLinkActionTemplate | null
      const externalUrl = sanitizeStringOrNull(
        tpl.externalUrl ?? tpl.external_url ?? null,
      )

      const inferredAction = externalUrl
        ? NotificationAction.OpenExternalUrl
        : deeplinkScreen
          ? NotificationAction.OpenDeepLink
          : null

      const dataTemplate: NotificationTemplateCreateInput = {
        name: tpl.name,
        title: tpl.title,
        body: tpl.body,
        iconName: tpl.iconName,
        languageCode: tpl.languageCode,
        shouldAddToBulletin: tpl.shouldAddToBulletin,
        shouldAddToHistory: tpl.shouldAddToHistory,
        shouldSendPush: tpl.shouldSendPush,
        deeplinkScreen: deeplinkScreen ?? null,
        deeplinkAction: deeplinkAction ?? null,
        externalUrl: externalUrl ?? null,
        action: inferredAction,
      } as NotificationTemplateCreateInput & { action: NotificationAction | null }

      setEditTemplateData({ id: idReq, data: dataTemplate })
      setIsCreateOpen(true)
    } catch (error) {
      console.error("Error fetching template", error)
    }
  }

  const templates: TemplateRow[] = useMemo(() => {
    if (!data?.notificationTemplates) return []

    return data.notificationTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      language: template.languageCode,
      icon: template.iconName as NotificationIcon,
      title: template.title,
      body: template.body,
      sendPush: template.shouldSendPush,
      addHistory: template.shouldAddToHistory,
      addBulletin: template.shouldAddToBulletin,
    }))
  }, [data])

  const handlePageChange = useCallback(
    ({ offset, limit }: { offset: number; limit: number }) => {
      setPageItems(templates.slice(offset, offset + limit))
    },
    [templates],
  )

  const hasTemplates = pageItems.length > 0

  const handleCloseModal = () => {
    setIsCreateOpen(false)
    setEditTemplateData(null)
  }

  const handleCreateTemplate = async (formData: NotificationTemplateCreateInput) => {
    setSubmitState({ loadingCreate: true, success: false })
    try {
      if (editTemplateData?.id) {
        const updateData = {
          ...formData,
          id: editTemplateData.id,
        }
        await updateTemplate(
          updateData as NotificationTemplateCreateInput & { id: string },
        )
      } else {
        await saveTemplate(formData as NotificationTemplateCreateInput)
      }
      setSubmitState((prev) => ({ ...prev, success: true }))
      await fetchTemplates()
      handleCloseModal()
    } catch (error) {
      const errorMessage = editTemplateData?.id
        ? "Error updating template."
        : "Error creating template."
      setSubmitState((prev) => ({ ...prev, error: errorMessage }))
      console.error(errorMessage, error)
    } finally {
      setSubmitState((prev) => ({ ...prev, loadingCreate: false }))
    }
  }

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return
    }

    try {
      await deleteTemplate(templateId)
      fetchTemplates()
    } catch (error) {
      console.error("Error deleting template", error)
    }
  }, [])

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

      <div className="border rounded-xl p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Language
                </th>
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
                    onClick={() => handleGetTemplate(template.id)}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{template.language}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex h-8 w-8 items-center justify-center text-lg">
                        <NotificationIconComponent name={template.icon} />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {template.title}
                        </div>
                        <div className="mt-1 text-gray-600">{template.body}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline-blue"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGetTemplate(template.id)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-red"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTemplate(template.id)
                          }}
                        >
                          Delete
                        </Button>
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
        <Pagination
          totalItems={visaTemplatesMock.length}
          onPageChange={handlePageChange}
        />
      </div>

      {isCreateOpen && (
        <CreateTemplateModal
          isOpen={isCreateOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateTemplate}
          isLoading={submitState.loadingCreate}
          editTemplateData={editTemplateData?.data}
        />
      )}
    </div>
  )
}
