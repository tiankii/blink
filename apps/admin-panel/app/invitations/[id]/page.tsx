"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import type { InvitationRow, InvitationStatus } from "../types"

import { InvitationCard } from "@/components/invitations/invitation-card"
import { ClientInfoCard } from "@/components/invitations/client-info-card"
import { StatusHistoryCard } from "@/components/invitations/status-history-card"
import { ChangeStatusModal } from "@/components/invitations/change-status-modal"

import { accountSearchInvitation } from "./search-invitation"
import { getHistory } from "./get-history"
import { AuditedAccountMainValues } from "../../types"
import { getInvitations, changeInvitationStatus } from "../getMessages"
import { NotificationMessagesQuery, NotificationMessageHistoryQuery } from "@/generated"

const formatDateTime = (date: Date | string | number) => {
  const d =
    typeof date === "number" && date < 1e12 ? new Date(date * 1000) : new Date(date)

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function InvitationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invitationUsername = params.id as string

  const [invitation, setInvitation] = useState<InvitationRow | null>(null)
  const [userData, setUserData] = useState<AuditedAccountMainValues | null>(null)
  const [invitationData, setInvitationData] = useState<NotificationMessagesQuery>()

  const [loading, setLoading] = useState<boolean>(true)
  const [events, setEvents] = useState<NotificationMessageHistoryQuery>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<InvitationStatus | null>(null)

  const loadAllData = async () => {
    setLoading(true)

    try {
      const userDataRes = await accountSearchInvitation(invitationUsername)
      setUserData(userDataRes)

      const invResult = await getInvitations(invitationUsername)
      if (invResult.notificationMessages && invResult.notificationMessages.length > 0) {
        setInvitationData(invResult)

        const messageId = invResult.notificationMessages[0].id
        const historyResult = await getHistory(messageId)
        setEvents(historyResult)

        const currentStatus = invResult.notificationMessages[0].status as InvitationStatus

        setInvitation({
          id: invResult.notificationMessages[0].id,
          status: invResult.notificationMessages[0].status as InvitationStatus,
          lastActivity: invResult.notificationMessages[0].updatedAt.toString(),
          sentBy: invResult.notificationMessages[0].sentBy,
          username: invResult.notificationMessages[0].username,
        })
        setSelectedStatus(currentStatus)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [invitationUsername])

  const handleChangeStatus = useCallback(
    async (invitationStatus: InvitationStatus) => {
      if (!invitation) return
      try {
        await changeInvitationStatus({
          id: invitation.id,
          status: invitationStatus,
        })
      } catch (error) {
        console.error("Error changing invitation:", error)
      }
    },
    [invitation],
  )

  const handleSaveStatus = () => {
    if (selectedStatus) {
      handleChangeStatus(selectedStatus)
      loadAllData()
      setIsModalOpen(false)
    }
  }

  if (!userData && !loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Invitation not found</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 lg:px-10">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading invitation details...</p>
        </div>
      ) : (
        <>
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">{userData?.username}</h1>
            <button
              onClick={() => router.push("/invitations")}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </header>

          <div className="space-y-6">
            <InvitationCard onChangeStatus={() => setIsModalOpen(true)} />

            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
              <ClientInfoCard invitation={invitationData} />

              <StatusHistoryCard events={events} formatDateTime={formatDateTime} />
            </div>
          </div>
        </>
      )}

      <ChangeStatusModal
        isOpen={isModalOpen}
        selectedStatus={selectedStatus}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={setSelectedStatus}
        onSave={handleSaveStatus}
      />
    </div>
  )
}
