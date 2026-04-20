# QLCV Frontend — Tài liệu kiến trúc & conventions

## 1. Tổng quan dự án

**Mục đích:** Ứng dụng quản lý hồ sơ (Task) với quy trình xử lý bước (workflow), hỗ trợ:
- Xem chi tiết hồ sơ, chuyển bước xử lý
- Quản lý hợp đồng (thêm/sửa/xóa)
- Lịch sử hoạt động (timeline)
- Phân công công việc
- Phê duyệt, thanh toán, từ chối hồ sơ
- Lấy tài liệu kèm theo

**Tech Stack:**
- Framework: Next.js (App Router)
- UI: Material-UI (MUI)
- State: React hooks (useState, useCallback, useEffect)
- API: axios (wrapper: `src/repositories/api.ts`)
- Type: TypeScript
- Toast/Notifications: react-toastify

---

## 2. Cấu trúc thư mục chính

```
src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx          # layout wrapper
│       └── shared/tasks/[id]/
│           ├── page.tsx        # task detail page (main logic)
│           └── README.md       # page-specific docs
├── components/
│   └── tasks/
│       ├── TaskLayout.tsx      # header + info common + stepper
│       ├── TaskLeftColumn.tsx  # action panel + assign + contracts table
│       ├── steps/
│       │   └── StepRenderer.tsx # render actions (next/approve/reject/...)
│       └── AssignSection.tsx   # phân công UI
├── repositories/
│   ├── api.ts                  # axios wrapper
│   ├── task.repo.ts            # task API calls
│   ├── contract.repo.ts        # contract API calls
│   ├── workflow.repo.ts        # workflow API calls
│   ├── constants.ts            # label mappings, error messages
│   └── normalize.ts (new)      # helper chuẩn hoá response
├── types/
│   └── index.ts                # TypeScript interfaces (Task, Contract, etc.)
├── lib/
│   └── normalize.ts            # normalizeList<T> helper
└── hooks/
    └── useAuth.ts (if exists)  # user context / auth state
```

---

## 3. Luồng dữ liệu chính

### 3.1 Task Detail Page (`/tasks/[id]`)

Trình tự:
1. **Mount:** `useEffect(() => fetchData(), [taskId])` — load task + history + contracts + workflow steps.
2. **Fetch tasks:**
   - `taskRepo.getTaskDetail(taskId)` → Task object
   - `taskRepo.getTaskHistory(taskId)` → TaskHistory[]
   - `contractRepo.getByTask(taskId)` (nếu task.contracts = null từ API)
   - `workflowRepo.getConfigs(task.workflow_id)` → WorkflowStepConfig[]
3. **Normalize & set state:** Kiểm tra null/undefined, normalize response trước set state.
4. **UI render:** TaskLayout (header) + TaskLeftColumn (actions + contracts) + History (right column).
5. **User action:** handleNextStep / handleApprove / handleReject / ... → repo call → fetchData(false) → toast.

### 3.2 Response patterns (API)

API có thể trả 3 dạng response:
- **Mảng trực tiếp:** `[{...}, {...}]`
- **Wrapped:** `{ data: [{...}] }` hoặc `{ data: { data: [...] } }`
- **Null:** khi không có dữ liệu

**Giải pháp:** Dùng helper `normalizeList<T>` ở layer repo:

```typescript
// src/lib/normalize.ts
export function normalizeList<T>(resp: unknown): T[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as any;
  if (Array.isArray(r.data)) return r.data as T[];
  if (r.data && Array.isArray(r.data.data)) return r.data.data as T[];
  return [];
}

// src/repositories/contract.repo.ts
async getByTask(taskId: string | number): Promise<Contract[]> {
  const resp = await api.get(`/tasks/${taskId}/contracts`);
  return normalizeList<Contract>(resp?.data ?? resp);
}
```

---

## 4. Component hierarchy

```
TaskLayout (header + info + stepper)
├── children
│   ├── TaskLeftColumn (actions + assign + contracts)
│   │   ├── StepRenderer (action buttons: next/approve/reject/...)
│   │   ├── AssignSection (phân công)
│   │   └── Contracts table (list + edit/delete buttons)
│   └── Right column (History timeline)
│       └── Timeline (history.map(...))
```

### 4.1 Props flow

**page.tsx → TaskLayout:**
- task, createdBy, stepLabels, totalSteps, currentStepConfig, onBack, onAddContract, contracts, children

**page.tsx → TaskLeftColumn:**
- task, userRole, currentStepConfig, totalSteps, canAct, canAssign
- handlers: handleNextStep, handleConfirmPayment, handleComplete, handleApprove, handleReject, fetchData
- contracts, openEditContract, setDeleteContractId, openCreateContract

---

## 5. Types chính

### Task
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  current_step: number;
  step_status?: StepStatus;
  status: 'ACTIVE' | 'REJECTED' | 'DONE';
  is_paid: boolean;
  is_collected: boolean;
  amount?: number | null;
  deadline?: string | null; // ⚠️ API dùng "deadline", không phải "due_date"
  contracts?: Contract[] | null;
  documents?: TaskDocument[] | null;
  current_step_config?: WorkflowStepConfig | null;
  customer?: Customer | null;
  created_by?: number | object | null;
  created_at: string;
  updated_at: string;
  // ...more fields
}
```

### TaskHistory
```typescript
interface TaskHistory {
  id: number;
  action_type: 'NEXT_STEP' | 'REJECT' | 'APPROVE' | 'ASSIGN' | 'UPLOAD' | 'PAYMENT' | string;
  note?: string | null;
  file_url?: string | null;
  created_by?: number | null;
  user_id?: number | null;
  actor_name?: string | null;
  user?: { id?: number; full_name?: string | null; email?: string | null } | null;
  created_at?: string | null;
}
```

### Contract
```typescript
interface Contract {
  id: number;
  task_id?: number;
  contract_number?: string;
  title?: string;
  contract_type?: string;
  value?: number;
  signing_date?: string;
  effective_date?: string;
  expiry_date?: string;
  status?: string;
  note?: string;
  // ...
}
```

---

## 6. Error handling & messages

Tập trung ở `src/app/(dashboard)/shared/tasks/[id]/page.tsx`:

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  ROLE_NOT_ALLOWED: 'Bạn không có quyền thực hiện bước này',
  PAYMENT_REQUIRED: 'Cần xác nhận thanh toán trước khi chuyển bước',
  FILE_REQUIRED: 'Cần upload tài liệu trước khi chuyển bước',
  STEP_MISMATCH: 'Bước hiện tại không khớp, vui lòng tải lại trang',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  // ...
};

function extractErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as any).response;
    const code = resp?.data?.code;
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    return resp?.data?.message;
  }
  return undefined;
}

// Dùng trong handlers:
try {
  await taskRepo.nextStep(task.id, { note, file });
  toast.success('Chuyển bước thành công');
  await fetchData(false);
} catch (err) {
  const msg = extractErrorMessage(err) || 'Lỗi không xác định';
  toast.error(msg);
}
```

---

## 7. Best practices & conventions

### 7.1 Repository layer
- **Luôn trả kiểu chuẩn:** Repo method phải trả luôn kiểu đã type (không raw response).
- **Normalize ở repo:** Xử lý null/undefined/wrapped response ở đây, UI nhận dữ liệu sạch.
- **Error propagation:** Throw error lên UI để UI xử lý toast/message.

Ví dụ tốt:
```typescript
// contract.repo.ts
async getByTask(taskId: string | number): Promise<Contract[]> {
  const resp = await api.get(`/tasks/${taskId}/contracts`);
  return normalizeList<Contract>(resp?.data ?? resp); // ✅ luôn trả Contract[]
}
```

### 7.2 Component props
- Props phải typed (không any nếu tránh được).
- Callback handlers tên bắt đầu bằng `on` hoặc `handle` (ví dụ: `onAddContract`, `handleNextStep`).
- State phải có default value (tránh undefined runtime error).

### 7.3 Types / TypeScript
- Cập nhật `src/types/index.ts` khi backend trả field mới (đừng dùng `as any`).
- Dùng optional chaining (`?.`) để truy cập nested fields: `task?.customer?.full_name`.
- Dùng nullish coalescing (`??`) khi có fallback: `user?.full_name ?? 'Unknown'`.

### 7.4 Async & data fetching
- Dùng `useCallback` cho handlers để tránh re-render lặp.
- Gọi `fetchData(false)` sau action để update UI (không show loading khi chỉ refetch).
- Kiểm tra loading/error state trước render.

Ví dụ:
```typescript
const handleNextStep = useCallback(async (note?: string, file?: File) => {
  try {
    setLoading(true);
    await taskRepo.nextStep(task!.id, { note, file });
    toast.success('Chuyển bước thành công');
    await fetchData(false); // refetch without loading spinner
  } catch (err) {
    toast.error(extractErrorMessage(err) || 'Lỗi');
  } finally {
    setLoading(false);
  }
}, [task, fetchData]);
```

---

## 8. Common issues & solutions

| Lỗi | Nguyên nhân | Cách sửa |
|-----|------------|---------|
| "Cannot read properties of undefined" | truy cập field null/undefined | dùng optional chaining: `obj?.field` |
| Property '...' does not exist on type | type định nghĩa thiếu field | cập nhật types/index.ts |
| API response format khác | response từ endpoint trả wrapped/mảng | normalize ở repo.getByTask() |
| Component props kiểu sai | callback không match interface | check handler signature + rename props rõ ràng |

---

## 9. Testing checklist

- [ ] Tất cả component render mà không lỗi undefined.
- [ ] Handlers (nextStep, approve, reject) gọi đúng API + fetchData.
- [ ] Error message hiển thị khi API fail.
- [ ] Dialog (contract, delete confirm) mở/đóng đúng.
- [ ] History timeline hiển thị ngay cả khi empty.
- [ ] Contracts table cập nhật sau thêm/sửa/xóa.

---

## 10. Checklist tối ưu tiếp theo (prioritized)

- [ ] Di chuyển contract dialog logic vào component riêng (ContractPanel).
- [ ] Tách History thành component (HistoryTimeline).
- [ ] Thêm unit tests cho fetchData, handlers, error extraction.
- [ ] Cập nhật types từ backend spec chính thức.
- [ ] Bật strict type-check ở tsconfig.json.
- [ ] Tài liệu API endpoint spec (OpenAPI/Swagger nếu có).

---

## 11. Liên hệ & support

- Lỗi type: kiểm tra `src/types/index.ts` và run `npx tsc --noEmit`.
- Lỗi API: kiểm tra response từ backend (Postman / network tab).
- Component render: xem console browser để debug.
- Restart: `npm run dev` + TS server (Command Palette → Restart TS Server).

---

**Last updated:** April 15, 2026  
**Version:** 1.0  
**Author:** Dev team