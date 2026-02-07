/**
 * Custom Hooks Index
 *
 * Central export for all custom hooks
 */

export { useMediaQuery } from "./use-media-query"
// Comment hooks
export {
  useCommentsByReport,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "./useComment"
// Document hooks
export {
  useDeleteDocument,
  useDocument,
  useDocumentsByProject,
  useUpdateDocument,
  useUploadDocument,
} from "./useDocument"
// Emergency hooks
export {
  useAddEmergencyBalance,
  useEmergencyFund,
  useEmergencyTransactions,
  useRequestEmergencyFund,
  useVerifyEmergencyRequest,
} from "./useEmergency"
// Logistic hooks
export {
  useCreateLogisticItem,
  useDeleteLogisticItem,
  useLogisticItems,
  useLogisticStockSummary,
  useLogisticTransactions,
  useRecordLogisticTransaction,
  useUpdateLogisticItem,
} from "./useLogistic"
// Project hooks
export {
  useAddProjectMember,
  useCreateProject,
  useDeleteProject,
  useProject,
  useProjectBySlug,
  useProjectList,
  useProjectMembers,
  useRemoveMember,
  useUpdateMemberRole,
  useUpdateProject,
} from "./useProject"
// Report hooks
export {
  useAddReportTask,
  useCreateReport,
  useDeleteReport,
  useDeleteReportMedia,
  useDeleteReportTask,
  useReport,
  useReportBySlug,
  useReportsByProject,
  useUpdateReport,
  useUpdateReportTask,
  useUploadReportMedia,
} from "./useReport"
// User hooks
export { useSearchUsers } from "./useUser"
