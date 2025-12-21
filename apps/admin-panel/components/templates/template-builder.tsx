import { TemplateBuilderProps } from "./types"

import {
  DeepLinkAction,
  DeepLinkActionTemplate,
  DeepLinkScreen,
  DeepLinkScreenTemplate,
  NotificationIcon,
} from "@/generated"

import { NotificationAction } from "@/components/notification/types"
import { LanguageCodes } from "@/components/notification/languages"
import {
  Checkbox,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/shared/form-controls"

const isValidNotificationAction = (value: string): value is NotificationAction => {
  return Object.values(NotificationAction).includes(value as NotificationAction)
}

const CONSTANTS = {
  SELECT_CLASSES: "mt-1 block w-full rounded-md border border-gray-200 px-3 py-2",
  DEFAULT_SELECT_VALUE: "",
  DEFAULT_SELECT_LABEL: "None",
} as const

const toOptionalSelectValue = <T,>(
  value: string,
  parse: (value: string) => T,
): T | undefined => {
  if (value === CONSTANTS.DEFAULT_SELECT_VALUE) return
  return parse(value)
}

export function TemplateBuilder({ formState, updateFormField }: TemplateBuilderProps) {
  const isDeepLinkMode = formState.action === NotificationAction.OpenDeepLink
  const isExternalUrlMode = formState.action === NotificationAction.OpenExternalUrl

  const handleActionChange = (value: string) => {
    const nextAction = toOptionalSelectValue(value, (actionValue) => {
      return actionValue as NotificationAction
    })

    if (!nextAction) {
      updateFormField("action", nextAction)
      return
    }

    if (!isValidNotificationAction(nextAction)) {
      updateFormField("action", formState.action)
      return
    }

    updateFormField("action", nextAction)

    if (nextAction === NotificationAction.OpenDeepLink) {
      updateFormField("externalUrl", formState.externalUrl)
      return
    }

    if (nextAction === NotificationAction.OpenExternalUrl) {
      updateFormField("deeplinkScreen", formState.deeplinkScreen)
      updateFormField("deeplinkAction", formState.deeplinkAction)
      return
    }
  }

  return (
    <div className="mt-2 grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Template Name</label>
        <TextInput
          id="name"
          type="text"
          placeholder="e.g., Weekly Digest"
          value={formState.name}
          onChange={(event) => updateFormField("name", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Action</label>
          <SelectInput
            id="action"
            value={formState.action ?? CONSTANTS.DEFAULT_SELECT_VALUE}
            onChange={(event) => handleActionChange(event.target.value)}
            required
            className={CONSTANTS.SELECT_CLASSES}
          >
            <option value={CONSTANTS.DEFAULT_SELECT_VALUE}>
              {CONSTANTS.DEFAULT_SELECT_LABEL}
            </option>
            {Object.values(NotificationAction).map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </SelectInput>
        </div>

        {isDeepLinkMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deep Link Screen
              </label>
              <SelectInput
                id="deeplinkScreen"
                value={formState.deeplinkScreen ?? CONSTANTS.DEFAULT_SELECT_VALUE}
                onChange={(event) =>
                  updateFormField(
                    "deeplinkScreen",
                    toOptionalSelectValue(event.target.value, (screenValue) => {
                      return screenValue as DeepLinkScreenTemplate
                    }),
                  )
                }
                required
                className={CONSTANTS.SELECT_CLASSES}
              >
                <option value={CONSTANTS.DEFAULT_SELECT_VALUE}>
                  {CONSTANTS.DEFAULT_SELECT_LABEL}
                </option>
                {Object.values(DeepLinkScreen).map((screen) => (
                  <option key={screen} value={screen}>
                    {screen}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deep Link Action
              </label>
              <SelectInput
                id="deeplinkAction"
                value={formState.deeplinkAction ?? CONSTANTS.DEFAULT_SELECT_VALUE}
                onChange={(event) =>
                  updateFormField(
                    "deeplinkAction",
                    toOptionalSelectValue(event.target.value, (actionValue) => {
                      return actionValue as DeepLinkActionTemplate
                    }),
                  )
                }
                className={CONSTANTS.SELECT_CLASSES}
              >
                <option value={CONSTANTS.DEFAULT_SELECT_VALUE}>
                  {CONSTANTS.DEFAULT_SELECT_LABEL}
                </option>
                {Object.values(DeepLinkAction).map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </SelectInput>
            </div>
          </>
        )}
      </div>

      {isExternalUrlMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Open External Url
          </label>
          <TextInput
            id="externalUrl"
            type="url"
            placeholder="https://example.com"
            required
            value={formState.externalUrl ?? CONSTANTS.DEFAULT_SELECT_VALUE}
            onChange={(event) => updateFormField("externalUrl", event.target.value)}
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formState.shouldSendPush}
            onChange={(event) => updateFormField("shouldSendPush", event.target.checked)}
          />
          <span className="text-sm text-gray-700">Send Push Notification</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formState.shouldAddToHistory}
            onChange={(event) =>
              updateFormField("shouldAddToHistory", event.target.checked)
            }
          />
          <span className="text-sm text-gray-700">Add to History</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formState.shouldAddToBulletin}
            onChange={(event) =>
              updateFormField("shouldAddToBulletin", event.target.checked)
            }
          />
          <span className="text-sm text-gray-700">Add to Bulletin</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <SelectInput
            id="language"
            value={formState.languageCode}
            onChange={(event) => updateFormField("languageCode", event.target.value)}
            className={CONSTANTS.SELECT_CLASSES}
          >
            {Object.entries(LanguageCodes).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </SelectInput>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Icon</label>
          <SelectInput
            id="iconName"
            value={formState.iconName}
            onChange={(event) =>
              updateFormField("iconName", event.target.value as NotificationIcon)
            }
            className={CONSTANTS.SELECT_CLASSES}
          >
            <option value={CONSTANTS.DEFAULT_SELECT_VALUE}>
              {CONSTANTS.DEFAULT_SELECT_LABEL}
            </option>
            {Object.values(NotificationIcon).map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <TextInput
          id="title"
          type="text"
          placeholder="Enter title..."
          value={formState.title}
          onChange={(event) => updateFormField("title", event.target.value)}
          aria-label="Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Body</label>
        <TextArea
          id="body"
          rows={4}
          value={formState.body}
          onChange={(event) => updateFormField("body", event.target.value)}
          placeholder="Enter body content..."
        />
      </div>
    </div>
  )
}
