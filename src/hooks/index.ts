/**
 * Custom Hooks Index
 *
 * Central export for all custom hooks
 */

export { useIsMobile } from "./use-mobile";
// Comment hooks
export {
  useCommentsByReport,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "./useComment";
// Dashboard hooks
export {
  useAdminStats,
  useArchitectDashboard,
  useArchitectStats,
  useCEORecentReports,
  useCEOStats,
  useFinanceFundBreakdown,
  useFinanceRecentTransactions,
  useFinanceStats,
  useMandorRecentReports,
  useMandorStats,
} from "./useDashboard";
// Document hooks
export {
  useDeleteDocument,
  useDocument,
  useDocumentsAnalytics,
  useDocumentsByProject,
  useUpdateDocument,
  useUploadDocument,
} from "./useDocument";
// Emergency hooks
export {
  useAddEmergencyBalance,
  useEmergencyAnalytics,
  useEmergencyFund,
  useEmergencyTransactions,
  useRequestEmergencyFund,
  useVerifyEmergencyRequest,
} from "./useEmergency";
// Logistic hooks
export {
  useCreateLogisticItem,
  useDeleteLogisticItem,
  useLogisticItems,
  useLogisticStockSummary,
  useLogisticsAnalytics,
  useLogisticTransactions,
  useRecordLogisticTransaction,
  useUpdateLogisticItem,
} from "./useLogistic";
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
} from "./useProject";
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
} from "./useReport";
// User hooks
export {
  useApproveUser,
  useBulkApprove,
  useCurrentUser,
  useDeleteUser,
  useRejectUser,
  useSearchUsers,
  useUpdateUserRole,
  useUserDetails,
  useUserList,
  useUserListWithFilter,
} from "./useUser";
