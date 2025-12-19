import type { Event } from "../../app/invitations/types"
import { NotificationMessageHistoryQuery } from "../../generated"

interface StatusHistoryCardProps {
  events: NotificationMessageHistoryQuery[]
  getActor: (event: Event) => string
  formatDate: (date: Date | string) => string
}

export function StatusHistoryCard({
  events,
  getActor,
  formatDate,
}: StatusHistoryCardProps) {
  return (
    <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Status History</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.notificationMessageHistory[0].id}>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {event.notificationMessageHistory[0].status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                  No events yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
