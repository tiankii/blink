import type { InvitationStatus } from "../../app/invitations/types"
import { NotificationMessageStatus } from "@/generated"
import { SelectInput } from "../shared/form-controls"

interface ChangeStatusModalProps {
  isOpen: boolean
  selectedStatus: InvitationStatus | null
  onClose: () => void
  onStatusChange: (status: InvitationStatus) => void
  onSave: () => void
}

export function ChangeStatusModal({
  isOpen,
  selectedStatus,
  onClose,
  onStatusChange,
  onSave,
}: ChangeStatusModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Change User Status</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <SelectInput
                value={selectedStatus || ""}
                onChange={(e) => onStatusChange(e.target.value as InvitationStatus)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(NotificationMessageStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="rounded-md bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
