type IconProps = {
  name: string
  className?: string
}

const iconMap: Record<string, string> = {
  ARROW_LEFT: "←",
  ARROW_RIGHT: "→",
  BACKSPACE: "⌫",
  BANK: "🏦",
  BELL: "🔔",
  BITCOIN: "₿",
  BOOK: "📖",
  BTC_BOOK: "📗",
  CARET_DOWN: "▼",
  CARET_LEFT: "◀",
  CARET_RIGHT: "▶",
  CARET_UP: "▲",
  CHECK: "✓",
  CHECK_CIRCLE: "✅",
  CLOSE: "✕",
  CLOSE_CROSS_WITH_BACKGROUND: "❌",
  COINS: "🪙",
  COPY_PASTE: "📋",
  DOLLAR: "$",
  EYE: "👁",
  EYE_SLASH: "🙈",
  FILTER: "�filter",
  GLOBE: "🌐",
  GRAPH: "📈",
  IMAGE: "🖼",
  INFO: "ℹ",
  LIGHTNING: "⚡",
  LINK: "🔗",
  LOADING: "⟳",
  MAGNIFYING_GLASS: "🔍",
  MAP: "🗺",
  MENU: "☰",
  NOTE: "📝",
  PAYMENT_ERROR: "❌",
  PAYMENT_PENDING: "⏳",
  PAYMENT_SUCCESS: "✅",
  PENCIL: "✏️",
  PEOPLE: "👥",
  QR_CODE: "⊡",
  QUESTION: "❓",
  RANK: "🏆",
  RECEIVE: "📥",
  REFRESH: "🔄",
  SEND: "📤",
  SETTINGS: "⚙",
  SHARE: "↗",
  TRANSFER: "⇄",
  USER: "👤",
  VIDEO: "🎥",
  WARNING: "⚠",
  WARNING_WITH_BACKGROUND: "⚠️",
}

export function NotificationIconComponent({ name, className = "" }: IconProps) {
  const icon = iconMap[name] || "●"

  return <span className={className}>{icon}</span>
}
