import { GT } from "@/graphql/index"
import Timestamp from "@/graphql/shared/types/scalar/timestamp"
import NotificationMessageStatus from "@/graphql/admin/types/scalar/notification-message-status"

const NotificationMessage = GT.Object<{
  id: string
  username: string
  templateId: string
  status: MsgMessageStatus
  sentBy: string
  updatedAt: number
}>({
  name: "NotificationMessage",
  fields: () => ({
    id: {
      type: GT.NonNullID,
    },
    username: {
      type: GT.NonNull(GT.String),
    },
    status: {
      type: GT.NonNull(NotificationMessageStatus),
    },
    sentBy: {
      type: GT.NonNull(GT.String),
    },
    templateId: {
      type: GT.NonNullID,
    },
    updatedAt: {
      type: GT.NonNull(Timestamp),
    },
  }),
})

export default NotificationMessage
