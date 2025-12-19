"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { visaInvitationsMock, visaTemplatesMock } from "../../mock-data"
import type { Event, InvitationRow, TemplateRow, InvitationStatus } from "../types"

import { InvitationCard } from "../../../components/invitations/invitation-card"
import { ClientInfoCard } from "../../../components/invitations/client-info-card"
import { StatusHistoryCard } from "../../../components/invitations/status-history-card"
import { ChangeStatusModal } from "../../../components/invitations/change-status-modal"

import { accountSearchInvitation } from "./search-invitation"
import { getHistory } from "./get-history"
import { AuditedAccountMainValues } from "../../types"
import { getInvitations, changeInvitationStatus } from "../getMessages"
import {
  NotificationMessagesQuery,
  NotificationMessageHistoryQuery,
} from "../../../generated"

type EditableContent = {
  title: string
  body: string
} | null

const InvitationStatuses: Record<InvitationStatus, { label: string; color: string }> = {
  INVITED: {
    label: "Invited",
    color: "bg-orange-500 text-white",
  },
  BANNER_CLICKED: {
    label: "Banner Clicked",
    color: "bg-yellow-300 text-white",
  },
  INVITATION_INFO_COMPLETED: {
    label: "Invitation Info Completed",
    color: "bg-lime-300 text-white",
  },
  KYC_INITIATED: {
    label: "KYC Initiated",
    color: "bg-lime-500 text-white",
  },
  KYC_PASSED: {
    label: "KYC Passed",
    color: "bg-green-500 text-white",
  },
  CARD_INFO_SUBMITTED: {
    label: "Card Info Submitted",
    color: "bg-sky-500 text-white",
  },
  CARD_APPROVED: {
    label: "Card Approved",
    color: "bg-violet-800 text-white",
  },
  INVITE_WITHDRAWN: {
    label: "Invite Withdraw",
    color: "bg-neutral-400 text-white",
  },
  KYC_FAILED: {
    label: "KYC Fail",
    color: "bg-red-500 text-white",
  },
  CARD_DENIED: {
    label: "Card Denied",
    color: "bg-red-600 text-white",
  },
} as const

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatDateTime = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
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
  const invitationUsername = params.username as string

  const [invitation, setInvitation] = useState<InvitationRow | null>(null)
  const [userData, setUserData] = useState<AuditedAccountMainValues | null>(null)
  const [invitationData, setInvitationData] = useState<NotificationMessagesQuery>()

  const [loading, setLoading] = useState<boolean>(true)
  const [events, setEvents] = useState<NotificationMessageHistoryQuery[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<InvitationStatus | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const handleChangeStatus = useCallback(async (invitationStatus: InvitationStatus) => {
    if (!userData) return
    try {
      await changeInvitationStatus({
        id: userData.id,
        status: invitationStatus,
      })
    } catch (error) {
      console.error("Error changing invitation:", error)
    }
  }, [])

  /*const fetchUserData = async (invitationUsername: string) => {
    try {
      const data = await accountSearchInvitation(invitationUsername)
      setUserData(data)
      console.log("data user", userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitationData = async () => {
    try {
      const result = await getInvitations(invitationUsername)
      setInvitationData(result.notificationMessages[0])
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (idReq: string) => {
    try {
      const result = await getHistory(idReq)
      console.log("RESULT DE HISTORY", result)
      setEvents(result)
    } catch (error) {
      console.error("Error fetching history", error)
    }
  }*/

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)

      try {
        const userData = await accountSearchInvitation(invitationUsername)
        setUserData(userData)
        console.log("data user", userData)

        const invResult = await getInvitations(invitationUsername)
        if (invResult.notificationMessages && invResult.notificationMessages.length > 0) {
          setInvitationData(invResult.notificationMessages[0])

          const messageId = invResult.notificationMessages[0].id
          const historyResult = await getHistory(messageId)
          console.log("RESULT DE HISTORY", historyResult)
          setEvents(historyResult)

          // 4. Setear la invitation
          setInvitation({
            id: invResult.notificationMessages[0].id,
            status: invResult.notificationMessages[0].status as InvitationStatus,
            lastActivity: invResult.notificationMessages[0].updatedAt.toString(),
            sentBy: invResult.notificationMessages[0].sentBy,
            username: invResult.notificationMessages[0].username,
          })
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [invitationUsername])

  /*const handleContentChange = (field: "title" | "body", value: string) => {
    setEditableContent((prev) => {
      if (!prev) return { title: "", body: "" }
      return {
        ...prev,
        [field]: value,
      }
    })
  }*/

  const handleStatusChange = (newStatus: InvitationStatus) => {
    if (!invitation) return

    /*const newEvent: Event = {
      id: `evt_${invitation.id}_${Date.now()}`,
      type: "Status Change",
      timestamp: new Date().toISOString(),
      description: `Status changed to ${InvitationStatuses[newStatus].label}`,
      sentBy: "Admin",
    }

    const updatedInvitation = {
      ...invitation,
      status: newStatus,
      lastActivity: new Date().toISOString().split("T")[0],
    }

    setInvitation(updatedInvitation)
    setEvents([newEvent, ...events])*/
  }

  /*const handleResendInvitation = () => {
    if (!invitation || !editableContent) return

    const newEvent: Event = {
      id: `evt_${invitation.id}_${Date.now()}`,
      type: "Invitation Sent",
      timestamp: new Date().toISOString(),
      description: `Invitation resent with template: ${editableContent.title}`,
      sentBy: "Admin",
    }

    setEvents([newEvent, ...events])
  }*/

  /*const handleRevokeInvitation = () => {
    if (!invitation) return
    handleStatusChange("revoked")
  }*/

  const handleChangeStatusClick = () => {
    setIsModalOpen(true)
    setSelectedStatus(invitation?.status)
  }

  const handleSaveStatus = () => {
    if (selectedStatus) {
      handleStatusChange(selectedStatus)
      setIsModalOpen(false)
      setSelectedTemplate("")
    }
  }

  const getActor = (event: Event) => {
    return event.sentBy || "System"
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
            <InvitationCard onChangeStatus={() => handleChangeStatus} />

            <div className="grid gap-6 lg:grid-cols-3">
              <ClientInfoCard invitation={invitationData} />

              <StatusHistoryCard
                events={events}
                getActor={getActor}
                formatDate={formatDate}
              />
            </div>
          </div>
        </>
      )}

      <ChangeStatusModal
        isOpen={isModalOpen}
        selectedStatus={selectedStatus}
        selectedTemplate={selectedTemplate}
        templates={visaTemplatesMock}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={setSelectedStatus}
        onSave={handleSaveStatus}
      />
    </div>
  )
}
