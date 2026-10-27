import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";

export const teamMemberRoles = { LEADER: "Trưởng nhóm", MEMBER: "Thành viên", VIEWER: "Người xem" } as const;

export function teamErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiProblem) {
    const messages: Record<string, string> = {
      TEAM_HAS_OPEN_PROJECTS: "Nhóm còn dự án đang hoạt động. Hãy hoàn tất hoặc chuyển dự án sang nhóm khác trước khi ngừng hoạt động.",
      TEAM_MEMBER_HAS_OPEN_TASKS: "Thành viên còn công việc chưa hoàn tất trong dự án của nhóm. Hãy chuyển người phụ trách trước khi xóa hoặc đổi sang Người xem.",
      TEAM_INACTIVE: "Nhóm đã ngừng hoạt động. Hãy kích hoạt lại trước khi thay đổi thành viên.",
      USER_INACTIVE: "Người dùng đã ngừng hoạt động. Hãy chọn người dùng khác.",
      VALIDATION_ERROR: "Dữ liệu chưa hợp lệ. Kiểm tra tên nhóm, người dùng và vai trò rồi thử lại.",
    };
    if (error.problem.code && messages[error.problem.code]) return messages[error.problem.code];
  }
  return getSafeApiErrorMessage(error, fallback);
}
