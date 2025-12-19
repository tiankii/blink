import { GT } from "@/graphql/index"
import { mapAndParseErrorForGqlResponse } from "@/graphql/error-map"
import NotificationMessage from "@/graphql/admin/types/object/notification-message"
import NotificationMessageStatus from "@/graphql/admin/types/scalar/notification-message-status"
import { NotificationsService } from "@/services/notifications"

const NotificationMessagesQuery = GT.Field<
  null,
  GraphQLAdminContext,
  {
    username?: string | Error
    status?: MsgMessageStatus | Error
    updatedAtFrom?: number | Error
    updatedAtTo?: number | Error
    limit?: number | Error
    offset?: number | Error
  }
>({
  type: GT.NonNullList(NotificationMessage),
  args: {
    username: { type: GT.String },
    status: { type: NotificationMessageStatus },
    updatedAtFrom: { type: GT.Int },
    updatedAtTo: { type: GT.Int },
    limit: { type: GT.Int },
    offset: { type: GT.Int },
  },
  resolve: async (_, args) => {
    const notificationsService = NotificationsService()

    if (args.username instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.username)
    }

    if (args.status instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.status)
    }

    if (args.updatedAtFrom instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.updatedAtFrom)
    }

    if (args.updatedAtTo instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.updatedAtTo)
    }

    if (args.limit instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.limit)
    }

    if (args.offset instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.offset)
    }

    const res = await notificationsService.msgMessagesList({
      username: args.username,
      status: args.status,
      updatedAtFrom: args.updatedAtFrom,
      updatedAtTo: args.updatedAtTo,
      limit: args.limit,
      offset: args.offset,
    })
    if (res instanceof Error) {
      throw mapAndParseErrorForGqlResponse(res)
    }

    return res
  },
})

export default NotificationMessagesQuery
