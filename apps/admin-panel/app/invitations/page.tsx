"use client"

import { useMemo, useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"

import { formatDateDisplay } from "../utils"
import { Button } from "../../components/shared/button"
import { Pagination } from "../../components/shared/pagination"
import { TextInput, SelectInput } from "../../components/shared/form-controls"
import { visaInvitationsMock } from "../mock-data"

import {
  invitationStatusMeta,
  INVITATION_FILTER_ALL,
  InvitationRow,
  StatusFilter,
} from "./types"

export default function InvitationsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(INVITATION_FILTER_ALL)
  const [dateFilter, setDateFilter] = useState("")
  const [pageItems, setPageItems] = useState<InvitationRow[]>([])

  const resetKey = useMemo(
    () => `${search}|${statusFilter}|${dateFilter}`,
    [search, statusFilter, dateFilter],
  )

  const handleRowClick = useCallback(
    (id: string) => {
      startTransition(() => {
        router.push(`/invitations/${encodeURIComponent(id)}`)
      })
    },
    [router],
  )

  const handlePageChange = useCallback(
    ({ offset, limit }: { offset: number; limit: number }) => {
      setPageItems(visaInvitationsMock.slice(offset, offset + limit))
    },
    [],
  )

  const handleCreateNew = useCallback(() => {
    startTransition(() => {
      router.push("/invitations/new")
    })
  }, [router])

  const hasInvitations = pageItems.length > 0

  return (
    <div className="px-6 py-6 lg:px-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Invitations</h1>
        <Button onClick={handleCreateNew} disabled={isPending}>
          <span className="mr-2">➤</span>
          <span>Send New Invitation</span>
        </Button>
      </header>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <TextInput
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search invitations"
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-10 md:w-48"
          aria-label="Filter by status"
        >
          <option value={INVITATION_FILTER_ALL}>All Statuses</option>
          {Object.entries(invitationStatusMeta).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </SelectInput>
        <TextInput
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 md:w-60"
          aria-label="Filter by date"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500">
                Last Activity
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500">
                Sent By
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {hasInvitations ? (
              pageItems.map((row) => {
                const meta = invitationStatusMeta[row.status]
                const formattedDate = formatDateDisplay(row.lastActivity)

                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(row.id)}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                      {row.id}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formattedDate}</td>
                    <td className="px-6 py-4 text-gray-700">{row.sentBy}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline-blue"
                          onClick={() => handleRowClick(row.id)}
                        >
                          View
                        </Button>
                        <Button variant="outline-red">Revoke</Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={visaInvitationsMock.length}
        resetKey={resetKey}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
