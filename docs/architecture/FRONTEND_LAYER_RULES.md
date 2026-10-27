# Frontend Layer Rules

Đây là contract bắt buộc khi tạo hoặc refactor UI trong QLCV Next. Mục tiêu là giữ route mỏng,
component tái sử dụng được và business logic nằm đúng feature/service boundary.

## Layer contract

| Layer | Mục đích | Ví dụ | Vị trí chuẩn |
| --- | --- | --- | --- |
| `atoms` | Primitive nhỏ nhất. Không compose component khác. Không business logic, không gọi API. | `Button`, `Input`, `Label`, `IconButton`, `Badge` | `src/components/atoms/` |
| `molecules` | Kết hợp một vài atoms. Có thể nhận props và xử lý UI state rất nhỏ; phải tái sử dụng được giữa feature. | `FormField = Label + Input + ErrorMessage`, `SearchField`, `UserStatus` | `src/components/molecules/` |
| `organisms` | Block đặc thù feature. Có thể compose atoms/molecules, giữ local state, gọi query hook hoặc wire Server Action theo contract. | `LoginForm`, `ProjectBoard`, `ProjectDetailPanel` | `src/features/<feature>/ui/organisms/` |
| `templates` | Layout wrapper dùng nhiều page. Sở hữu cấu trúc shell, navigation, slot/children; không chứa dữ liệu domain cụ thể. | `AuthLayout`, `WorkspaceLayout`, `TwoColumnTemplate` | `src/components/templates/` hoặc `src/layouts/` |
| `pages` | Route-level của Next.js. Mỏng, chỉ lấy route params/search params và orchestrate template/organisms. | `app/login/page.tsx`, `app/projects/page.tsx` | `src/app/**/page.tsx` |

## Quy tắc bắt buộc

### Atoms

- Không import atom khác hoặc molecule/organism.
- Không import `features`, `services`, `api`, `router` hoặc `server action`.
- Không chứa business vocabulary như `ProjectStatus`, `InvoiceState`.
- Không tự đọc `process.env`, localStorage, query cache hoặc URL.
- Chỉ xử lý presentation, accessibility props và event callback do parent truyền vào.
- Mọi interactive atom phải có keyboard focus, accessible name và touch target tối thiểu 44px.

### Molecules

- Có thể compose atoms, nhưng không compose organism/template.
- Không gọi API và không biết route cụ thể.
- Local state chỉ dành cho UI tức thời: focus, reveal password, input draft, expanded/collapsed.
- Error/loading được nhận qua props hoặc shared feedback component.
- Tên molecule phải mô tả pattern UI, không gắn với một domain nếu có thể dùng chung.

### Organisms

- Là nơi feature-specific UI được phép biết domain model và query/mutation hooks.
- Có thể giữ local state của block: selected task, open drawer, filter, optimistic UI draft.
- Server Action chỉ được gọi thông qua service/use-case boundary; không viết fetch trực tiếp trong JSX.
- Phải xử lý các state thích hợp: loading, empty, error, forbidden, locked, conflict/stale.
- Không import trực tiếp `page.tsx` của feature khác; dùng public export hoặc shared contract.
- Organism lớn nên tách tiếp thành molecules/atoms, không dùng một file làm “god component”.

### Templates

- Chỉ sở hữu layout và composition slots: sidebar, topbar, content, detail panel.
- Không gọi domain API, không chứa mock data, không hard-code tên project/customer/task.
- Có thể nhận `children`, `slots`, `navigationItems` và layout options.
- Template dùng chung phải nằm ngoài `features`; template chỉ thuộc một feature thì đặt trong feature đó và ghi rõ phạm vi.

### Pages

- `src/app/**/page.tsx` là adapter của Next.js, không phải nơi xây UI chi tiết.
- Được phép đọc `params`, `searchParams`, metadata và truyền chúng xuống screen/organism.
- Không chứa API client, query key, business rule hoặc mock data.
- Mỗi page phải có heading có nghĩa để Next.js route announcement hoạt động đúng.
- Với page cần client state, giữ `use client` ở screen/organism gần nhất, không lan lên route nếu không cần.

## Dependency matrix

| From \\ To | Atoms | Molecules | Organisms | Templates | Services | Pages |
| --- | --- | --- | --- | --- | --- | --- |
| `atoms` | — | Không | Không | Không | Không | Không |
| `molecules` | Có | — | Không | Không | Không | Không |
| `organisms` | Có | Có | — | Không | Qua hooks/service | Không |
| `templates` | Có | Có | Qua slots/props | — | Không | Không |
| `services` | Không | Không | Không | Không | — | Không |
| `pages` | Gián tiếp | Gián tiếp | Có | Có | Không trực tiếp | — |

Luồng hợp lệ:

```text
app/page.tsx
  → template/layout
  → feature screen/organism
  → feature hook/service
  → services/http + endpoint
```

Luồng cấm:

```text
atom → feature/api
shared → feature/internal
page.tsx → fetch trực tiếp
template → project/customer/task data
```

## Quy tắc đặt tên và export

- File dùng kebab-case: `form-field.tsx`, `project-detail-panel.tsx`.
- Component export named; page có thể default export theo yêu cầu Next.js.
- Mỗi feature có `index.ts` làm public API. Import từ `@/features/projects`, không import sâu vào private file từ `app`.
- Mỗi shared layer có `index.ts` khi có từ hai component trở lên. Component dùng chung import từ `@/components/...`.
- `model/` chứa type, schema, mapper và view-model; không chứa JSX.
- `services/` chứa transport, endpoint, request/response adapter; không chứa JSX.
- `utils` chỉ dành cho hàm thuần, không có side effect; utility domain-specific đặt trong feature `lib/`.

## Checklist trước khi merge

- [ ] Component đã đặt đúng layer và đúng thư mục.
- [ ] Atom không compose component khác và không có business logic.
- [ ] Molecule không gọi API hoặc biết route.
- [ ] Organism xử lý đủ state cần thiết và không thành god component.
- [ ] Template không chứa domain data.
- [ ] `app/**/page.tsx` chỉ orchestrate.
- [ ] Không import xuyên vào internal file của feature khác.
- [ ] Có keyboard focus, accessible label và responsive behavior.
- [ ] Có test/typecheck/lint phù hợp.
