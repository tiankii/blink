"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"

import { visaTemplatesMock } from "../mock-data"
import { Button } from "../../components/shared/button"
import { Pagination } from "../../components/shared/pagination"
import { NotificationIconComponent } from "../../components/invitations/invitation-icon"
import { TemplateIcon, TemplateRow } from "../invitations/types"
import { getTemplates, getTemplateById, deleteTemplate } from "./getTemplates"
import { saveTemplate, updateTemplate } from "./save-templates"
import {
  NotificationTemplatesQuery,
  NotificationTemplateCreateInput,
  NotificationIcon,
} from "../../generated"

import { CreateTemplateModal } from "../../components/templates/create-template-modal"

type SubmitState = {
  loadingCreate: boolean
  success: boolean
  error?: string
}

export default function TemplatesPage() {
  const [pageItems, setPageItems] = useState<TemplateRow[]>(visaTemplatesMock.slice(0, 0))
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editTemplateData, setEditTemplateData] = useState<{
    id?: string
    data?: NotificationTemplateCreateInput | undefined
  }>()

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

  const handleGetTemplate = async (idReq: string) => {
    try {
      const data = await getTemplateById(idReq)

      if (!data.notificationByTemplateId) return

      const dataTemplate: NotificationTemplateCreateInput = {
        name: data.notificationByTemplateId.name,
        title: data.notificationByTemplateId.title,
        body: data.notificationByTemplateId.body,
        iconName: data.notificationByTemplateId.iconName,
        languageCode: data.notificationByTemplateId.languageCode,
        shouldAddToBulletin: data.notificationByTemplateId.shouldAddToBulletin,
        shouldAddToHistory: data.notificationByTemplateId.shouldAddToHistory,
        shouldSendPush: data.notificationByTemplateId.shouldSendPush,
        deeplinkScreen: data.notificationByTemplateId.deeplinkScreen,
        notificationAction: data.notificationByTemplateId.notificationAction,
      }

      setEditTemplateData({ id: idReq, data: dataTemplate })
      setIsCreateOpen(true)
    } catch (error) {
      console.error(error)
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

  const handlePageChange = useCallback(
    ({ offset, limit }: { offset: number; limit: number }) => {
      setPageItems(visaTemplatesMock.slice(offset, offset + limit))
    },
    [],
  )

  const hasTemplates = pageItems.length > 0

  const handleCloseModal = () => {
    setIsCreateOpen(false)
    setEditTemplateData(undefined)
  }

  const handleCreateTemplate = async (formData: NotificationTemplateCreateInput) => {
    setSubmitState({ loadingCreate: true, success: false, error: undefined })

    try {
      if (editTemplateData?.id) {
        const updateData = {
          ...formData,
          id: editTemplateData.id,
        }
        await updateTemplate(updateData)
      } else {
        await saveTemplate(formData)
      }
      setSubmitState((prev) => ({ ...prev, success: true }))
      await fetchTemplates()
      handleCloseModal()
    } catch (error) {
      const errorMessage = editTemplateData?.id
        ? "Error updating template."
        : "Error creating template."
      setSubmitState((prev) => ({ ...prev, error: errorMessage }))
      console.error(submitState.error)
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
      console.error("Error deleting template")
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
