export type InvitationStatus = "pending" | "accepted" | "revoked"

export type InvitationRow = {
  id: string
  status: InvitationStatus
  lastActivity: string
  sentBy: string
}

export const InvitationStatusFilter = {
  All: "all",
  Pending: "pending",
  Accepted: "accepted",
  Revoked: "revoked",
} as const

export type StatusFilter =
  (typeof InvitationStatusFilter)[keyof typeof InvitationStatusFilter]

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
