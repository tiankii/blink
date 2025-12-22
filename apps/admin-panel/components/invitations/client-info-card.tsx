import { InvitationStatusBadge } from "./status-badge"
import type { InvitationStatus } from "../../app/invitations/types"
import { NotificationMessagesQuery } from "@/generated"

interface ClientInfoCardProps {
  invitation?: NotificationMessagesQuery
}

export function ClientInfoCard({ invitation }: ClientInfoCardProps) {
  const invitationData = invitation?.notificationMessages?.[0]

  if (!invitationData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">No invitation data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Client Invitation Info</h3>
      <table className="mt-4 w-full text-sm">
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="py-2 font-medium text-gray-700">Invitation ID</td>
            <td className="py-2 text-gray-900">{invitationData.id}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium tex-gray-700">LN Address</td>
            <td className="py-2 text-gray-900">{invitationData.username}@blink.sv</td>
          </tr>
          <tr>
            <td className="py-2 font-medium text-gray-700">Status</td>
            <td className="py-2">
              <InvitationStatusBadge status={invitationData.status as InvitationStatus} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
