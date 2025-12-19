"use client"

import type { InvitationStatus } from "../../app/invitations/types"

type InvitationStatusBadgeProps = {
  status: InvitationStatus
  label?: string
}

const invitationStatusMeta: Record<
  InvitationStatus,
  { label: string; className: string }
> = {
  INVITED: {
    label: "Invited",
    className: "bg-orange-500 text-white",
  },
  BANNER_CLICKED: {
    label: "Banner Clicked",
    className: "bg-yellow-300 text-white",
  },
  INVITATION_INFO_COMPLETED: {
    label: "Invitation Info Completed",
    className: "bg-lime-300 text-white",
  },
  KYC_INITIATED: {
    label: "KYC Initiated",
    className: "bg-lime-500 text-white",
  },
  KYC_PASSED: {
    label: "KYC Passed",
    className: "bg-green-500 text-white",
  },
  CARD_INFO_SUBMITTED: {
    label: "Card Info Submitted",
    className: "bg-sky-500 text-white",
  },
  CARD_APPROVED: {
    label: "Card Approved",
    className: "bg-violet-800 text-white",
  },
  INVITE_WITHDRAWN: {
    label: "Invite Withdraw",
    className: "bg-neutral-400 text-white",
  },
  KYC_FAILED: {
    label: "KYC Fail",
    className: "bg-red-500 text-white",
  },
  CARD_DENIED: {
    label: "Card Denied",
    className: "bg-red-600 text-white",
  },
}

export function InvitationStatusBadge({ status, label }: InvitationStatusBadgeProps) {
  const meta = invitationStatusMeta[status] || "INVITED"

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
    >
      {label ?? meta.label}
    </span>
  )
}
