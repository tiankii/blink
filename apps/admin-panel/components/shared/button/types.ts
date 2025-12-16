import type { ButtonHTMLAttributes } from "react"

export type ButtonVariant = "primary" | "outline-blue" | "outline-red" | "outline"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}
