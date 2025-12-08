"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

import { visaTemplatesMock } from "../mock-data"
import { Button } from "../../components/shared/button"
import { Pagination } from "../../components/shared/pagination"
import { TemplateIcon, TemplateRow } from "../invitations/types"

export default function TemplatesPage() {
  const router = useRouter()
  const [pageItems, setPageItems] = useState<TemplateRow[]>(visaTemplatesMock.slice(0, 0))

  const handlePageChange = useCallback(
    ({ offset, limit }: { offset: number; limit: number }) => {
      setPageItems(visaTemplatesMock.slice(offset, offset + limit))
    },
    [visaTemplatesMock],
  )

  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <Button onClick={() => router.push("/templates/new")}>
          <span className="mr-2">＋</span>
          <span>Create New Template</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4 text-sm font-medium text-gray-900">
          Existing Templates
        </div>
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
            {pageItems.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
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
                    <Button variant="outline-blue">Edit</Button>
                    <Button variant="outline-red">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
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
    </div>
  )
}
