import { GT } from "@/graphql/index"
import Language from "@/graphql/shared/types/scalar/language"
import NotificationTemplate from "@/graphql/admin/types/object/notification-template"
import { NotificationsService } from "@/services/notifications"
import { mapAndParseErrorForGqlResponse } from "@/graphql/error-map"

const NotificationTemplatesResult = GT.Object<{
  total: number
  items: {
    id: string
    name: string
    languageCode: string
    iconName: string
    title: string
    body: string
    status: MsgMessageStatus
    shouldSendPush: boolean
    shouldAddToHistory: boolean
    shouldAddToBulletin: boolean
    deeplinkAction?: string
    deeplinkScreen?: string
    externalUrl?: string
  }[]
}>({
  name: "NotificationTemplatesResult",
  fields: () => ({
    total: { type: GT.NonNull(GT.Int) },
    items: { type: GT.NonNullList(NotificationTemplate) },
  }),
})

const NotificationTemplatesQuery = GT.Field<
  null,
  GraphQLAdminContext,
  {
    languageCode?: string | Error
    limit?: number | Error
    offset?: number | Error
  }
>({
  type: GT.NonNull(NotificationTemplatesResult),
  args: {
    languageCode: { type: Language },
    limit: { type: GT.Int },
    offset: { type: GT.Int },
  },
  resolve: async (_, args) => {
    const notificationsService = NotificationsService()

    if (args.languageCode instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.languageCode)
    }

    if (args.limit instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.limit)
    }

    if (args.offset instanceof Error) {
      throw mapAndParseErrorForGqlResponse(args.offset)
    }

    const res = await notificationsService.msgTemplatesList({
      languageCode: args.languageCode,
      limit: args.limit,
      offset: args.offset,
    })

    if (res instanceof Error) {
      throw mapAndParseErrorForGqlResponse(res)
    }

    return res
  },
})

export default NotificationTemplatesQuery
