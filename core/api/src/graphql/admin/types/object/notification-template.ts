import { GT } from "@/graphql/index"
import Language from "@/graphql/shared/types/scalar/language"

const NotificationTemplate = GT.Object<{
  id: string
  name: string
  languageCode: string
  iconName: string
  title: string
  body: string
}>({
  name: "NotificationTemplate",
  fields: () => ({
    id: {
      type: GT.NonNullID,
    },
    name: {
      type: GT.NonNull(GT.String),
    },
    languageCode: {
      type: GT.NonNull(Language),
    },
    iconName: {
      type: GT.NonNull(GT.String),
    },
    title: {
      type: GT.NonNull(GT.String),
    },
    body: {
      type: GT.NonNull(GT.String),
    },
  }),
})

export default NotificationTemplate
