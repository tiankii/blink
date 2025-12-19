import { NotificationMessageStatus, NotificationIcon } from "../../generated"

export const InvitationStatusOptions = {
  All: "ALL",
  ...NotificationMessageStatus,
} as const

export type StatusFilter =
  (typeof InvitationStatusOptions)[keyof typeof InvitationStatusOptions]

export type InvitationStatus = Exclude<StatusFilter, "ALL">

export type InvitationRow = {
  id: string
  status: InvitationStatus
  lastActivity: string
  sentBy: string
  username: string
}

export const TemplateIcon = {
  Star: "star",
  Check: "check",
  Bell: "bell",
}

export type TemplateIcon = (typeof TemplateIcon)[keyof typeof TemplateIcon]

export type TemplateRow = {
  id: string
  name: string
  language: string
  icon: NotificationIcon
  title: string
  body: string
  sendPush: boolean
  addHistory: boolean
  addBulletin: boolean
  deeplinkScreen?: string | null
  deeplinkAction?: string | null
  externalUrl?: string | null
}

export type Event = {
  id: string
  type: string
  timestamp: string
  description: string
  sentBy?: string
}

export type EditableContent = {
  title: string
  body: string
} | null

export type FormStateMessage = {
  userQuery: string
  templateId: string
  title: string
  body: string
  sendPush: boolean
  addHistory: boolean
  addBulletin: boolean
}

export type SubmitState = {
  loading: boolean
  success: boolean
  error?: string
}
