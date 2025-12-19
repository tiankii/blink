"use client"

import { useMemo, useState, useCallback, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"

import { formatDateDisplay } from "../utils"
import { Button } from "../../components/shared/button"
import { Pagination } from "../../components/shared/pagination"
import { TextInput, SelectInput } from "../../components/shared/form-controls"
import { InvitationStatusBadge } from "../../components/invitations/status-badge"
import { CreateMessageModal } from "../../components/invitations/create-message-modal"
import {
  userIdByUsername,
  triggerMarketingNotification,
} from "../../components/notification/notification-actions"

import {
  InvitationStatusOptions,
  InvitationRow,
  StatusFilter,
  InvitationStatus,
  SubmitState,
  FormStateMessage,
} from "./types"
import { getInvitations, changeInvitationStatus } from "./getMessages"
import {
  NotificationMessagesQuery,
  MarketingNotificationTriggerInput,
  NotificationIcon,
  NotificationMessageStatus,
} from "../../generated"
import { SaveInvitation } from "./new/save-invitation"

const statusFilterOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: InvitationStatusOptions.All, label: "All Statuses" },
  { value: InvitationStatusOptions.Invited, label: "Invited" },
  { value: InvitationStatusOptions.BannerClicked, label: "Banner Clicked" },
  {
    value: InvitationStatusOptions.InvitationInfoCompleted,
    label: "Invitation Info Completed",
  },
  { value: InvitationStatusOptions.KycInitiated, label: "KYC Initiated" },
  { value: InvitationStatusOptions.KycPassed, label: "KYC Passed" },
  { value: InvitationStatusOptions.CardInfoSubmitted, label: "Card Info Submitted" },
  { value: InvitationStatusOptions.CardApproved, label: "Card Approved" },
  { value: InvitationStatusOptions.InviteWithdrawn, label: "Invite Withdraw" },
  { value: InvitationStatusOptions.KycFailed, label: "KYC Fail" },
  { value: InvitationStatusOptions.CardDenied, label: "Card Denied" },
]

export default function InvitationsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<NotificationMessagesQuery | null>(null)
  const [loading, setLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    InvitationStatusOptions.All,
  )
  const [dateFilter, setDateFilter] = useState("")
  const [pageItems, setPageItems] = useState<InvitationRow[]>([])

  const fetchData = async () => {
    try {
      const result = await getInvitations()
      setData(result)
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const invitations: InvitationRow[] = useMemo(() => {
    if (!data?.notificationMessages) return []

    return data.notificationMessages.map((message) => ({
      id: message.id,
      status: message.status as InvitationStatus,
      lastActivity: message.updatedAt.toString(),
      sentBy: message.sentBy,
      username: message.username,
    }))
  }, [data])

  const filteredInvitations = useMemo(() => {
    return invitations.filter((invitation) => {
      const matchesSearch = invitation.username
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === InvitationStatusOptions.All || invitation.status === statusFilter

      const matchesDate =
        !dateFilter ||
        new Date(invitation.lastActivity).toISOString().split("T")[0] === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invitations, search, statusFilter, dateFilter])

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
      setPageItems(filteredInvitations.slice(offset, offset + limit))
    },
    [filteredInvitations],
  )

  const handleCreateNew = useCallback(() => {
    startTransition(() => {
      router.push("/invitations/new")
    })
  }, [router])

  const handleRevokeInvitation = useCallback(async (invitationId: string) => {
    setRevokingId(invitationId)
    try {
      await changeInvitationStatus({
        id: invitationId,
        status: NotificationMessageStatus.CardDenied,
      })

      const result = await getInvitations()
      setData(result)
    } catch (error) {
      console.error("Error revoking invitation:", error)
    } finally {
      setRevokingId(null)
    }
  }, [])

  const [submitState, setSubmitState] = useState<SubmitState>({
    loading: false,
    success: false,
    error: undefined,
  })

  /*const handleCreateMessage = async (
    formData: FormStateMessage,
    invitationTemplate: MarketingNotificationTriggerInput,
  ) => {
    setSubmitState({ loading: true, success: false, error: undefined })

    try {
      const userIdRes = await userIdByUsername(formData.userQuery)

      if (userIdRes.userId === undefined) {
        setSubmitState({
          loading: false,
          success: false,
          error: userIdRes.message || "User not found",
        })
        return
      }

      if (!invitationTemplate) {
        setSubmitState({
          loading: false,
          success: false,
          error: "Invitation template is not selected.",
        })
        return
      }

      const res = await triggerMarketingNotification({
        userIdsFilter: [userIdRes.userId],
        openDeepLink: { screen: "CHAT" },
        icon: invitationTemplate.icon as NotificationIcon,
        shouldSendPush: invitationTemplate.shouldSendPush,
        shouldAddToBulletin: invitationTemplate.shouldAddToBulletin,
        shouldAddToHistory: invitationTemplate.shouldAddToHistory,
        localizedNotificationContents: invitationTemplate.localizedNotificationContents,
      })

      if (res.success) {
        setSubmitState({
          loading: false,
          success: true,
          error: undefined,
        })
        await SaveInvitation({
          sentBy: "admin", // Should be username from session user
          username: formData.userQuery,
          status: NotificationMessageStatus.Invited,
        })

        return
      } else {
        setSubmitState({
          loading: false,
          success: false,
          error: res.message || "Failed to send invitation.",
        })
      }
    } catch (error) {
      setSubmitState({
        loading: false,
        success: false,
        error: "Error sending invitation.",
      })
    }
  }*/

  const hasInvitations = pageItems.length > 0

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg text-gray-500">Loading invitations...</div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 lg:px-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Invitations</h1>
        <Button onClick={handleCreateNew} disabled={isPending}>
          <span className="mr-2">➤</span>
          <span>Send New Invitation</span>
        </Button>
      </header>
      <div className="border rounded-xl p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center pa-5">
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
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
          <TextInput
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 md:w-60"
            aria-label="Filter by date"
            placeholder="Filter by date"
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
                pageItems.map((invitation) => {
                  const formattedDate = formatDateDisplay(invitation.lastActivity)
                  const isRevoking = revokingId === invitation.id

                  return (
                    <tr
                      key={invitation.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(invitation.username)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                        {invitation.username}
                      </td>
                      <td className="px-6 py-4">
                        <InvitationStatusBadge status={invitation.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formattedDate}</td>
                      <td className="px-6 py-4 text-gray-700">{invitation.sentBy}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline-blue"
                            onClick={() => handleRowClick(invitation.username)}
                            disabled={isRevoking}
                          >
                            View
                          </Button>
                          {invitation.status === InvitationStatusOptions.Invited && (
                            <Button
                              variant="outline-red"
                              onClick={() => handleRevokeInvitation(invitation.id)}
                              disabled={isRevoking}
                            >
                              {isRevoking ? "Revoking..." : "Revoke"}
                            </Button>
                          )}
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
          totalItems={filteredInvitations.length}
          resetKey={resetKey}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
