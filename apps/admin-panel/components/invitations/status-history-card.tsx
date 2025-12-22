import { NotificationMessageHistoryQuery } from "@/generated"

interface StatusHistoryCardProps {
  events?: NotificationMessageHistoryQuery
  formatDateTime: (date: Date | string | number) => string
}

export function StatusHistoryCard({ events, formatDateTime }: StatusHistoryCardProps) {
  if (!events?.notificationMessageHistory) {
    return (
      <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Status History</h3>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Status History</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Added At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.notificationMessageHistory.length > 0 ? (
              events.notificationMessageHistory.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 text-gray-900">{event.status}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatDateTime(event.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-3 text-center text-gray-500">
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
