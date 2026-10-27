# UI Review — Dashboard QLCV

**Ngày:** 2026-09-08  
**Phạm vi:** `/` — `src/app/page.tsx`, `src/app/globals.css`, `design-system/qlcv-next/MASTER.md`  
**Vai trò:** UI/UX reviewer  
**Trạng thái:** Review-only; không sửa production code, không thêm library, không thêm fake API data.

## Kết luận ngắn

Dashboard hiện đã có nền tảng tốt về semantic structure: có `main`, `aside`, heading, table, `aria-current` và các breakpoint cơ bản. Tuy vậy, cảm giác sản phẩm hiện tại vẫn nghiêng về “nhiều card được trang trí” hơn là một workspace vận hành tinh gọn. Vấn đề lớn nhất không phải thiếu màu hay thiếu hiệu ứng; đó là hierarchy chưa đủ quyết đoán, surface quá nhiều, typography đang trộn hai ngôn ngữ và dữ liệu hiển thị chưa trung thực với trạng thái backend.

Hướng nên theo là **calm operations workspace**: navigation quiet như Linear/Notion, content canvas thoáng và có nhịp như Vercel, chỉ một focal point cho việc cần quyết định. Giữ nền navy/gold của design system nhưng giảm gradient, blur, shadow và số lượng panel có nền riêng.

## Findings ưu tiên

### P0 — Dashboard đang hiển thị dữ liệu cứng như dữ liệu vận hành thật

**Evidence:** `attentionItems` và `portfolioRows` được khai báo hardcode tại `page.tsx:16-26`; chúng được render trực tiếp ở `page.tsx:47-50`. Trong khi đó metrics lại hiển thị `—` và các ghi chú “Chờ summary endpoint”.

**Vấn đề:** Ba lớp thông tin có độ tin cậy khác nhau đang đứng cạnh nhau nhưng không được phân biệt rõ: release/gate là dữ liệu workflow, danh mục hồ sơ là nội dung mẫu, metrics là chưa có dữ liệu. Điều này làm giảm trust và khiến dashboard giống mockup hơn sản phẩm thật.

**Đề xuất triển khai:** Không thêm dữ liệu giả để lấp khoảng trống. Khi chưa có canonical endpoint, dùng một empty state rõ ràng theo từng module: “Chưa có dữ liệu hồ sơ”, “Chưa kết nối summary”, kèm link tới nguồn dữ liệu hoặc action hợp lệ. Khi có dữ liệu, map từ server state và hiển thị timestamp/last synced ở những vùng quan trọng.

**Acceptance signal:** Người dùng phân biệt được `live`, `empty`, `loading` và `unavailable` chỉ bằng nội dung và treatment; không có row hồ sơ mẫu xuất hiện trong môi trường không có dữ liệu.

### P1 — Có quá nhiều focal point mạnh cùng lúc

**Evidence:** Hero heading rất lớn (`globals.css:52-54`), CTA có shadow (`:55`), status strip có shadow (`:56`), metric đầu tiên là navy (`:57`), attention panel cũng navy (`:58`), flow panel là cream (`:59`).

**Vấn đề:** Mắt bị kéo đồng thời về hero, CTA, metric đầu, “Điểm nghẽn” và “Chuỗi bàn giao”. Linear/Vercel thường để một primary action và một primary content block thắng rõ ràng; Notion dùng nền phẳng và hierarchy bằng typography/spacing hơn là nhiều nền màu.

**Đề xuất triển khai:** Chọn `Điểm nghẽn vận hành` làm focal point duy nhất. Hero dùng nền canvas, CTA là solid navy nhưng không cần shadow lớn. Metric cards chuyển về một surface trung tính; chỉ dùng accent gold cho trạng thái hoặc một metric cần chú ý. Flow panel trở thành secondary block không màu riêng.

**Acceptance signal:** Khi nhìn nhanh 3 giây, người dùng trả lời được “cần xử lý gì trước?” mà không bị phân tâm bởi hơn một vùng tương phản cao.

### P1 — CSS có nhiều lớp override theo lịch sử, làm visual system thiếu nhất quán

**Evidence:** Global tokens ở `globals.css:1`, dashboard shell bắt đầu ở `:28`, rồi tiếp tục override mạnh tại `:46-61`. Cùng một component có nhiều định nghĩa cho border, radius, background, padding và shadow.

**Vấn đề:** Đây là nguyên nhân dễ tạo ra cảm giác “đã thử nhiều phong cách” thay vì một design system có chủ đích. Thay đổi nhỏ sau này dễ tạo regression vì người triển khai phải đoán rule cuối cùng.

**Đề xuất triển khai:** Khi có story implementation, gom dashboard tokens thành một block duy nhất: canvas, surface, elevated surface, border, radius, shadow, spacing và type scale. Giữ CSS variables của `MASTER.md` làm nguồn tên; không rải raw hex và override lặp lại trong cùng selector. Đây là refactor style, không cần library.

**Acceptance signal:** Mỗi component dashboard có một rule set chính; không còn selector dashboard bị định nghĩa lại nhiều lần chỉ để đổi visual direction.

### P1 — Typography đang nói hai ngôn ngữ và chưa phù hợp với dashboard vận hành

**Evidence:** `MASTER.md` chọn EB Garamond + Lato, nhưng `globals.css:1` vẫn khai báo `Georgia` + `Arial`; dashboard heading dùng `var(--font-heading)` tại `:32`, `:53`, còn body kế thừa fallback Arial.

**Vấn đề:** Serif display lớn tạo cảm giác editorial/legal, nhưng số liệu, label, table và navigation lại mang chất browser-default/Arial. Kết quả là dashboard thiếu cảm giác sản phẩm hiện đại, đặc biệt ở các vùng dense.

**Đề xuất triển khai:** Chọn một quyết định dứt khoát: EB Garamond chỉ cho brand/hero section title; Lato cho toàn bộ UI, navigation, table, button và metric label. Thiết lập scale cố định 12/13/14/16/20/28/48 thay vì nhiều giá trị rời rạc. Không đổi font package; dùng font pipeline đã có trong app.

**Acceptance signal:** Navigation, table và button dùng cùng một sans family; heading có vai trò display rõ, không xuất hiện fallback Arial trong visual review.

### P1 — Navigation trên mobile là horizontal overflow ẩn, không phải mobile navigation

**Evidence:** Ở `globals.css:43`, các nav group sau group đầu bị `display:none`, còn `.dashboard-nav-list` thành horizontal scroll. Người dùng mobile không thấy `Vận hành` và `Quản trị`.

**Vấn đề:** Đây là mất chức năng chứ không chỉ là vấn đề thẩm mỹ. Pattern này cũng khác tinh thần Linear/Notion: mobile cần một context switcher/menu rõ ràng, không nên cắt bớt information architecture mà không báo cho người dùng.

**Đề xuất triển khai:** Giữ một mobile header tối giản với workspace name + menu button; mở toàn bộ navigation trong disclosure/drawer native của app. Nếu chưa làm drawer, hiển thị một “Xem tất cả điều hướng” link thật sự tới trang/menu đầy đủ. Không dùng horizontal scroll để chứa các nhóm nav khác nhau.

**Acceptance signal:** Tất cả destination hiện có thể truy cập bằng keyboard và touch ở viewport nhỏ; không cần đoán rằng thanh ngang còn nội dung.

### P1 — Action semantics chưa rõ: “Tạo công việc” là button nhưng không có flow

**Evidence:** CTA tại `page.tsx:43` là `<button>` không có handler; row actions tại `page.tsx:47` cũng là button không có handler.

**Vấn đề:** Perceived quality giảm mạnh khi control trông interactive nhưng không tạo state change. Đây là kiểu “demo affordance” dễ khiến người dùng mất tin tưởng.

**Đề xuất triển khai:** Nếu action chưa được nối, đổi sang link tới route đã tồn tại hoặc tạm thời dùng disabled state có helper text rõ ràng. Với attention rows, link đến artifact/route thật; nếu route chưa có, chỉ render item như read-only evidence, không giả dạng action.

**Acceptance signal:** Mỗi control có một destination hoặc state transition hợp lệ; không còn button dead-end trong dashboard.

### P2 — Status strip đang cạnh tranh với hero và chưa có responsive grouping tốt

**Evidence:** Status strip là một hàng inline ở `page.tsx:44`, có divider và link đẩy sang phải; mobile chỉ đổi sang wrap ở `globals.css:43`, rồi đổi border direction tại `:61`.

**Vấn đề:** Desktop strip chứa hai câu có trọng lượng tương đương và một link; mobile wrap có thể tạo thứ tự đọc khó đoán. Status của release nên là context, không nên nhìn như một banner cảnh báo lớn.

**Đề xuất triển khai:** Chuyển thành một compact status row: badge trạng thái + release name + `7 gates open` + link. Trên mobile xếp thành 2 dòng có thứ tự cố định, link nằm cùng dòng với count hoặc dưới cùng. Dùng màu semantic nhẹ, bỏ shadow.

**Acceptance signal:** Trên desktop và mobile, người dùng đọc được trạng thái → mức độ → next action theo cùng một thứ tự.

### P2 — Metric empty state hiện tại quá kỹ thuật và không giúp quyết định

**Evidence:** `page.tsx:45` hiển thị bốn dấu `—` với các note như “Chờ summary endpoint”, “Dữ liệu canonical”, “Không suy diễn từ list”.

**Vấn đề:** Đây là nội bộ implementation language bị đưa lên UI. Người dùng cần biết dữ liệu chưa sẵn sàng, vì sao và có thể làm gì; không cần biết tên endpoint hay nguyên tắc mapping của backend.

**Đề xuất triển khai:** Dùng empty state thân thiện theo từng metric: label giữ nguyên, value là `Chưa có`, note là “Đang kết nối dữ liệu” hoặc “Chưa phát sinh”, thêm `Cấu hình nguồn` chỉ khi action tồn tại. Với số liệu không thể tính an toàn, giải thích ngắn ở tooltip/help text, không đặt jargon vào card.

**Acceptance signal:** Copy có thể đọc được bởi partner không làm kỹ thuật; không xuất hiện “endpoint”, “canonical”, “suy diễn” trong UI vận hành.

### P2 — Bảng hồ sơ có density thấp nhưng lại dùng table treatment nặng

**Evidence:** `page.tsx:50` chỉ có ba row; CSS `:60` dùng padding dọc 15px, avatar và pill cùng lúc.

**Vấn đề:** Ba row chưa đủ để cần một data table rộng; trên desktop bảng tạo cảm giác trống, trên mobile buộc min-width `620px` và scroll ngang. Notion/Linear thường dùng list compact với primary entity, metadata và status rõ hơn khi dataset nhỏ.

**Đề xuất triển khai:** Giữ table semantic nếu contract yêu cầu, nhưng giảm visual chrome: bỏ avatar nếu không có ý nghĩa, đưa loại hồ sơ thành metadata dưới tên, giữ status và mốc tiếp theo là cột chính. Khi rỗng, dùng empty state full-width thay vì table header trống. Không thêm row mẫu để “làm đầy”.

**Acceptance signal:** Với 0–3 item, module vẫn cân đối; viewport mobile không cần scroll ngang chỉ để xem một danh sách ngắn.

### P2 — Iconography dùng ký tự Unicode làm giảm tính hoàn thiện và khả năng nhận biết

**Evidence:** Search dùng `⌕`, notification dùng `○`, CTA dùng `+`, action dùng `→` tại `page.tsx:41,43,44,47,50`.

**Vấn đề:** Ký tự Unicode có hình dáng phụ thuộc font/platform, baseline không đồng đều và không tạo được một icon language thống nhất. Điều này đặc biệt lộ rõ trong topbar và các action lặp lại.

**Đề xuất triển khai:** Không thêm icon library. Dùng CSS shape đơn giản cho trạng thái không cần icon, hoặc inline SVG nhỏ do codebase tự sở hữu với `aria-hidden=true`; thống nhất stroke, size và optical alignment. Search/notification/avatar cần khác nhau rõ ràng, không dùng circle rỗng để biểu diễn notification.

**Acceptance signal:** Icon render ổn định trên Chromium/Safari; icon button có label, 44px target và focus state dễ thấy.

### P2 — Shadow/blur và gradient đang làm surface “trôi”, thiếu cấu trúc kiểu workspace

**Evidence:** `backdrop-filter` ở `globals.css:50`, radial gradient ở `:49`, nhiều shadow ở `:55-58`.

**Vấn đề:** Với dashboard nhiều vùng, blur + translucent white + shadow đồng thời làm biên panel không rõ và tạo cảm giác marketing landing page. Linear/Vercel thường dùng border/subtle contrast để giữ grid; Notion gần như không phụ thuộc elevation cho mỗi section.

**Đề xuất triển khai:** Giữ một canvas phẳng, dùng border `1px` hoặc surface contrast cho grouping, chỉ cho shadow ở popover/modal. Nếu cần highlight, dùng một vùng tint duy nhất phía sau hero hoặc attention panel, không dùng cả hai.

**Acceptance signal:** Panel boundaries vẫn rõ ở màn hình sáng và khi zoom; giảm số lớp visual effect nhưng hierarchy lại dễ scan hơn.

## Layout/style direction đề xuất

### Desktop

```text
┌─ Sidebar 224 ─┬─ Topbar: workspace / search / account ───────────────┐
│                │                                                       │
│                │ H1 + one-line context                 [Tạo công việc] │
│                │ status: release · gates · next action                 │
│                │                                                       │
│                │ [Điểm nghẽn vận hành — primary] [Chuỗi bàn giao]      │
│                │                                                       │
│                │ Hồ sơ đang theo dõi / empty state hoặc compact list   │
└────────────────┴───────────────────────────────────────────────────────┘
```

- Canvas 8px base grid; section gap 24px, panel padding 20–24px.
- Một primary surface cho attention; các vùng còn lại neutral.
- H1 khoảng 40–48px, body 15–16px, metadata 12–13px.
- Sidebar dùng active state rõ bằng background + left indicator; không cần quá nhiều màu.

### Mobile

- Header: brand/workspace + menu; search là action riêng, không ép search input luôn rộng.
- Hero xếp title → context → CTA full/fit width.
- Status row xếp theo thứ tự release → count → action.
- Attention list trước metrics/table nếu mục tiêu là quyết định trong ngày.
- Không ẩn navigation group bằng CSS; dùng disclosure/menu thật.

## Nguyên tắc tham khảo đã áp dụng

- **Linear:** navigation quiet, active state rõ, content density có chủ đích, action inline gọn.
- **Vercel:** typography và whitespace tạo hierarchy; canvas sạch, surface ít nhưng tương phản chính xác.
- **Notion:** module chỉ hiển thị khi có nội dung có ích; empty state giải thích được trạng thái và next step, không dùng placeholder để giả cảm giác đầy.

Các nguyên tắc trên được điều chỉnh theo `MASTER.md`: giữ authority navy + trust gold, không đổi stack, không thêm dependency và không suy diễn dữ liệu khi backend chưa có contract.

## Thứ tự triển khai khuyến nghị

1. Loại bỏ hardcoded operational rows khỏi production state; định nghĩa loading/empty/unavailable states.
2. Chọn lại hierarchy: attention là primary, metrics/status là secondary, table là tertiary.
3. Gom CSS token/override và chốt typography UI.
4. Sửa mobile navigation và dead-end buttons.
5. Tinh chỉnh table/list, icon treatment, shadow/blur sau khi structure đã ổn.

**Review verdict:** `NEEDS_VISUAL_REWORK` — chưa cần thêm library; cần làm sạch hierarchy, dữ liệu và surface system trước khi gọi là polished.
