// TODO: Temporary mock data for development
// This file will be removed once invitation and template data is fetched via API
// Delete this file after API integration is complete

import { InvitationRow, TemplateRow } from "./invitations/types"

export const visaInvitationsMock: InvitationRow[] = [
  {
    id: "joedoe",
    status: "pending",
    lastActivity: "2025-12-03",
    sentBy: "Admin",
  },
  {
    id: "newuser1",
    status: "pending",
    lastActivity: "2025-12-01",
    sentBy: "Admin",
  },
  {
    id: "satoshi",
    status: "accepted",
    lastActivity: "2025-11-25",
    sentBy: "Admin",
  },
  {
    id: "newuser2",
    status: "accepted",
    lastActivity: "2025-11-23",
    sentBy: "Admin",
  },
  {
    id: "josenakamoto",
    status: "revoked",
    lastActivity: "2025-11-15",
    sentBy: "Admin",
  },
  {
    id: "newuser3",
    status: "pending",
    lastActivity: "2025-11-10",
    sentBy: "Admin",
  },
  {
    id: "newuser4",
    status: "pending",
    lastActivity: "2025-11-06",
    sentBy: "Admin",
  },
  {
    id: "aveotero",
    status: "pending",
    lastActivity: "2025-10-21",
    sentBy: "Admin",
  },
  {
    id: "olduser1",
    status: "revoked",
    lastActivity: "2025-09-26",
    sentBy: "Admin",
  },
  {
    id: "olduser2",
    status: "revoked",
    lastActivity: "2025-09-11",
    sentBy: "Admin",
  },
]

export const visaTemplatesMock: TemplateRow[] = [
  {
    id: "blink-private-en",
    name: "Blink Private Invite (EN)",
    language: "English",
    icon: "star",
    title: "Blink Private is here!",
    body: "Sign up to get your Visa card and more",
  },
  {
    id: "blink-private-es",
    name: "Blink Private Invite (ES)",
    language: "Spanish",
    icon: "star",
    title: "¡Blink Private ya está aquí!",
    body: "Regístrate para obtener tu tarjeta Visa y más",
  },
  {
    id: "blink-private-fr",
    name: "Blink Private Invite (FR)",
    language: "French",
    icon: "star",
    title: "Blink Private est arrivé !",
    body: "Inscrivez-vous pour obtenir votre carte Visa et plus encore",
  },
  {
    id: "blink-private-de",
    name: "Blink Private Invite (DE)",
    language: "German",
    icon: "star",
    title: "Blink Private ist da!",
    body: "Melden Sie sich an, um Ihre Visa-Karte und mehr zu erhalten",
  },
  {
    id: "card-active-en",
    name: "Card Active (EN)",
    language: "English",
    icon: "check",
    title: "Your Blink Private Card is Active!",
    body: "Your card is now active and ready to use.",
  },
]
