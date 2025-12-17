import { GT } from "@/graphql/index"

const NotificationMessageStatus = GT.Enum({
  name: "NotificationMessageStatus",
  values: {
    INVITED: { value: "invited" },
    BANNER_CLICKED: { value: "banner_clicked" },
    INVITATION_INFO_COMPLETED: { value: "invitation_info_completed" },
    KYC_INITIATED: { value: "kyc_initiated" },
    KYC_PASSED: { value: "kyc_passed" },
    CARD_INFO_SUBMITTED: { value: "card_info_submitted" },
    CARD_APPROVED: { value: "card_approved" },
    INVITE_WITHDRAWN: { value: "invite_withdrawn" },
    KYC_FAILED: { value: "kyc_failed" },
    CARD_DENIED: { value: "card_denied" },
  },
})

export default NotificationMessageStatus
