export type InvitationStatus = "pending" | "accepted" | "revoked"

export type InvitationRow = {
  id: string
  status: InvitationStatus
  lastActivity: string
  sentBy: string
}

export const invitationStatusMeta: Record<
  InvitationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700",
  },
  revoked: {
    label: "Revoked",
    className: "bg-red-100 text-red-700",
  },
}

export const INVITATION_FILTER_ALL = "all"

export type StatusFilter = InvitationStatus | typeof INVITATION_FILTER_ALL

export const TemplateIcon = {
  Star: "star",
  Check: "check",
}

export type TemplateIcon = (typeof TemplateIcon)[keyof typeof TemplateIcon]

export type TemplateRow = {
  id: string
  name: string
  language: string
  icon: TemplateIcon
  title: string
  body: string
}
