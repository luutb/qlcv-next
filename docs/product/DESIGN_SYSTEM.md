# WorkHub Design System

> Design system dành cho WorkHub Dashboard, Project Management, Task Management, Employee Management và Revenue Management.

## 1. Design Direction

Phong cách tổng thể:

```text
Linear
+
Modern Jira
+
Modern SaaS
```

Mục tiêu:

* Clean
* Professional
* Information-dense
* Minimal
* Modern SaaS
* Dễ scan thông tin
* Ít visual noise
* Typography và spacing tạo hierarchy thay vì lạm dụng card

Không sử dụng:

* Gradient không cần thiết
* Shadow quá mạnh
* Border quá nhiều
* Card lồng card
* Radius quá lớn
* Quá nhiều màu accent
* Heading quá lớn
* Icon nhiều màu không có ý nghĩa
* Hardcode màu tùy ý

---

# 2. Font Family

Font chính:

```css
font-family:
  Inter,
  "Be Vietnam Pro",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Ưu tiên:

```text
Inter
```

Nếu giao diện sử dụng nhiều tiếng Việt và muốn typography mềm hơn:

```text
Be Vietnam Pro
```

Không mix nhiều font trong cùng ứng dụng.

Recommended:

```css
--font-sans: "Inter", "Be Vietnam Pro", -apple-system,
             BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

# 3. Typography Scale

Không sử dụng font-size tùy ý.

Chỉ sử dụng typography scale sau.

## Display

```css
--text-display: 32px;
--line-display: 40px;
--weight-display: 700;
```

Chỉ dùng cho:

* Landing
* Empty state đặc biệt
* Marketing

Không nên dùng thường xuyên trong Dashboard.

---

## Page Title

```css
--text-page-title: 28px;
--line-page-title: 36px;
--weight-page-title: 700;
```

Ví dụ:

```text
Dự án
Nhân viên
Doanh thu
Công việc
```

---

## Section Title

```css
--text-section-title: 18px;
--line-section-title: 26px;
--weight-section-title: 600;
```

Ví dụ:

```text
Doanh thu

Công việc hôm nay

Dự án nổi bật

Nhân viên

Hoạt động gần đây
```

---

## Card Title

```css
--text-card-title: 16px;
--line-card-title: 24px;
--weight-card-title: 600;
```

---

## Body

```css
--text-body: 14px;
--line-body: 20px;
--weight-body: 400;
```

Đây là font mặc định của Dashboard.

Dùng cho:

* Table
* Description
* Form
* Menu
* Content

---

## Body Medium

```css
--text-body-medium: 14px;
--line-body-medium: 20px;
--weight-body-medium: 500;
```

Dùng cho:

* Table important text
* Project name
* Task name
* Navigation
* Button

---

## Small

```css
--text-small: 13px;
--line-small: 18px;
--weight-small: 400;
```

Dùng cho:

* Secondary information
* Project description
* Date
* Assignee metadata

---

## Caption

```css
--text-caption: 12px;
--line-caption: 16px;
--weight-caption: 400;
```

Dùng cho:

* Badge
* Tag
* Timestamp
* Helper text
* Chart label

Không sử dụng text nhỏ hơn `12px` cho content thông thường.

---

# 4. Font Weight

Chỉ sử dụng:

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

Tránh:

```text
300
800
900
```

trong Dashboard.

Hierarchy chính:

```text
Page title      700
KPI value       700
Section title   600
Card title      600
Project name    500/600
Button          500
Body            400
Metadata        400
```

---

# 5. KPI Typography

Ví dụ:

```text
Tổng công việc
128
↑ 12% so với tuần trước
```

Style:

```css
KPI Label
font-size: 13px;
line-height: 18px;
font-weight: 500;

KPI Value
font-size: 24px;
line-height: 32px;
font-weight: 700;

KPI Trend
font-size: 12px;
line-height: 16px;
font-weight: 500;
```

Không làm KPI value quá lớn.

Maximum recommended:

```text
24–28px
```

---

# 6. Colors

## Brand

```css
--primary: #4F46E5;
--primary-hover: #4338CA;
--primary-active: #3730A3;

--primary-subtle: #EEF2FF;
--primary-border: #C7D2FE;
```

Primary dùng cho:

* Primary button
* Active navigation
* Selected tab
* Progress
* Link quan trọng
* Focus

Không dùng primary làm background cho quá nhiều component.

---

# 7. Background & Surface

```css
--background: #F8FAFC;

--surface: #FFFFFF;

--surface-secondary: #F8FAFC;

--surface-muted: #F1F5F9;

--surface-hover: #F8FAFC;

--surface-selected: #EEF2FF;
```

Page:

```css
background: var(--background);
```

Card/Table/Drawer:

```css
background: var(--surface);
```

---

# 8. Text Colors

```css
--text-primary: #0F172A;

--text-secondary: #475569;

--text-muted: #94A3B8;

--text-disabled: #CBD5E1;

--text-inverse: #FFFFFF;
```

Usage:

```text
Heading
#0F172A

Body
#475569

Metadata
#94A3B8

Disabled
#CBD5E1
```

Không dùng pure black:

```text
#000000
```

---

# 9. Border

```css
--border: #E2E8F0;

--border-subtle: #F1F5F9;

--border-strong: #CBD5E1;

--border-focus: #818CF8;
```

Table separator:

```css
border-color: var(--border-subtle);
```

Card:

```css
border: 1px solid var(--border);
```

---

# 10. Sidebar

```css
--sidebar-background: #111827;

--sidebar-surface: #1F2937;

--sidebar-hover: #1E293B;

--sidebar-active: #334155;

--sidebar-text: #CBD5E1;

--sidebar-text-active: #FFFFFF;

--sidebar-icon: #94A3B8;

--sidebar-icon-active: #818CF8;
```

Recommended width:

```css
width: 232px;
```

Collapsed:

```css
width: 72px;
```

---

# 11. Semantic Colors

## Success

```css
--success: #10B981;
--success-dark: #059669;
--success-subtle: #D1FAE5;
--success-background: #ECFDF5;
```

## Warning

```css
--warning: #F59E0B;
--warning-dark: #D97706;
--warning-subtle: #FEF3C7;
--warning-background: #FFFBEB;
```

## Danger

```css
--danger: #EF4444;
--danger-dark: #DC2626;
--danger-subtle: #FEE2E2;
--danger-background: #FEF2F2;
```

## Info

```css
--info: #2563EB;
--info-subtle: #DBEAFE;
--info-background: #EFF6FF;
```

---

# 12. Project Status

## Đang thực hiện

```css
color: #2563EB;
background: #DBEAFE;
```

## Hoàn thành

```css
color: #059669;
background: #D1FAE5;
```

## Lên kế hoạch

```css
color: #7C3AED;
background: #EDE9FE;
```

## Có rủi ro

```css
color: #D97706;
background: #FEF3C7;
```

## Quá hạn

```css
color: #DC2626;
background: #FEE2E2;
```

## Chưa bắt đầu

```css
color: #64748B;
background: #F1F5F9;
```

---

# 13. Task Priority

## Low

```css
color: #2563EB;
background: #DBEAFE;
```

## Medium

```css
color: #D97706;
background: #FEF3C7;
```

## High

```css
color: #DC2626;
background: #FEE2E2;
```

## Urgent

```css
color: #BE123C;
background: #FFE4E6;
```

---

# 14. Revenue Colors

```css
--revenue: #2563EB;
--revenue-light: #DBEAFE;

--expense: #8B5CF6;
--expense-light: #EDE9FE;

--profit: #10B981;
--profit-light: #D1FAE5;

--positive: #10B981;

--negative: #EF4444;
```

Chart:

```text
Revenue     #2563EB
Expense     #8B5CF6
Profit      #10B981
```

---

# 15. Kanban Colors

## To Do

```css
--kanban-todo: #64748B;
--kanban-todo-bg: #F8FAFC;
```

## In Progress

```css
--kanban-progress: #2563EB;
--kanban-progress-bg: #EFF6FF;
```

## Review

```css
--kanban-review: #D97706;
--kanban-review-bg: #FFFBEB;
```

## Done

```css
--kanban-done: #059669;
--kanban-done-bg: #ECFDF5;
```

Column background phải rất nhẹ.

Không sử dụng saturated background cho toàn bộ column.

---

# 16. Department / Role Tags

## Frontend

```css
color: #2563EB;
background: #DBEAFE;
```

## Backend

```css
color: #DB2777;
background: #FCE7F3;
```

## UI/UX

```css
color: #7C3AED;
background: #EDE9FE;
```

## QA

```css
color: #DC2626;
background: #FEE2E2;
```

## Content

```css
color: #059669;
background: #D1FAE5;
```

## DevOps

```css
color: #475569;
background: #E2E8F0;
```

## SEO

```css
color: #9333EA;
background: #F3E8FF;
```

---

# 17. Spacing System

Chỉ sử dụng spacing scale:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

Không hardcode:

```text
13px
17px
19px
27px
```

trừ trường hợp đặc biệt.

---

# 18. Page Spacing

Desktop:

```css
padding-inline: 24px;
padding-block: 24px;
```

Large Desktop:

```css
padding-inline: 32px;
```

Tablet:

```css
padding-inline: 20px;
```

Mobile:

```css
padding-inline: 16px;
```

Khoảng cách:

```text
Page title → content
24px

Section → Section
24–32px

Card internal
16–20px

Form elements
12–16px

Label → Input
6–8px
```

---

# 19. Border Radius

```css
--radius-sm: 6px;

--radius-md: 8px;

--radius-lg: 12px;

--radius-xl: 16px;

--radius-full: 9999px;
```

Usage:

```text
Button
8px

Input
8px

Select
8px

Badge
6px / full

Card
12px

Table container
12px

Dialog
16px

Drawer
0px hoặc 16px bên trái

Avatar
9999px
```

Không sử dụng `20–32px` radius khắp Dashboard.

---

# 20. Shadows

UI chủ yếu sử dụng border.

Shadow chỉ dùng khi cần elevation.

## Small

```css
--shadow-sm:
  0 1px 2px rgba(15, 23, 42, 0.04);
```

## Medium

```css
--shadow-md:
  0 4px 12px rgba(15, 23, 42, 0.08);
```

## Large

```css
--shadow-lg:
  0 12px 32px rgba(15, 23, 42, 0.12);
```

Usage:

```text
Card
none / shadow-sm

Dropdown
shadow-md

Popover
shadow-md

Dialog
shadow-lg

Drawer
shadow-lg
```

Không dùng heavy shadow cho card thông thường.

---

# 21. Button

Height:

```text
Small     32px
Default   36px
Large     40px
```

Default:

```css
height: 36px;
padding: 0 14px;

font-size: 14px;
font-weight: 500;

border-radius: 8px;
```

## Primary

```css
background: #4F46E5;
color: #FFFFFF;
```

Hover:

```css
background: #4338CA;
```

## Secondary

```css
background: #FFFFFF;
color: #334155;

border: 1px solid #E2E8F0;
```

Hover:

```css
background: #F8FAFC;
```

## Ghost

```css
background: transparent;
```

Hover:

```css
background: #F1F5F9;
```

## Danger

```css
background: #EF4444;
color: #FFFFFF;
```

---

# 22. Input

Default:

```css
height: 36px;

padding:
  0 12px;

font-size:
  14px;

background:
  #FFFFFF;

border:
  1px solid #E2E8F0;

border-radius:
  8px;
```

Focus:

```css
border-color: #818CF8;

box-shadow:
  0 0 0 3px rgba(99, 102, 241, 0.12);
```

Placeholder:

```css
color: #94A3B8;
```

---

# 23. Badge

```css
height: 22–24px;

padding:
  0 8px;

font-size:
  12px;

font-weight:
  500;

border-radius:
  6px;
```

Badge không được quá lớn.

---

# 24. Card

Default:

```css
background: #FFFFFF;

border:
  1px solid #E2E8F0;

border-radius:
  12px;

padding:
  16px;
```

Dashboard larger card:

```css
padding: 20px;
```

Không tự động bọc mọi section trong Card.

Trước khi tạo Card hãy cân nhắc:

```text
Có thể dùng spacing + heading + separator không?
```

Nếu có thì ưu tiên cách đó.

---

# 25. Table

Header:

```css
height: 40px;

font-size: 12px;

font-weight: 500;

color: #64748B;

background: #F8FAFC;
```

Row:

```css
min-height: 64px;

font-size: 14px;

border-bottom:
  1px solid #F1F5F9;
```

Hover:

```css
background: #F8FAFC;
```

Selected:

```css
background: #EEF2FF;
```

Project name:

```css
font-size: 14px;
font-weight: 600;
color: #0F172A;
```

Description:

```css
font-size: 12px;
line-height: 16px;
color: #64748B;
```

---

# 26. Progress Bar

Default:

```css
height: 6px;

background: #E2E8F0;

border-radius: 9999px;
```

Progress:

```css
background: #4F46E5;
```

Height variants:

```text
Compact
4px

Default
6px

Large
8px
```

---

# 27. Avatar

Sizes:

```text
XS    24px
SM    28px
MD    32px
LG    40px
XL    48px
```

Table:

```text
28–32px
```

Avatar Group:

```text
28px
overlap: -8px
border: 2px solid white
```

Maximum visible:

```text
4
```

Sau đó:

```text
+5
```

---

# 28. Icons

Recommended:

```text
Lucide Icons
```

Sizes:

```text
Small
14px

Default
16px

Navigation
18px

Feature
20px

Large
24px
```

Stroke:

```text
1.5–2
```

Không mix nhiều icon libraries nếu không cần thiết.

---

# 29. Drawer

Project Detail / Task Detail / Employee Detail sử dụng chung drawer system.

Desktop:

```css
width: 50%;
max-width: 800px;
min-width: 600px;
```

Tablet:

```css
width: 70%;
```

Mobile:

```css
width: 100%;
```

Background:

```css
background: #FFFFFF;
```

Overlay:

```css
background:
  rgba(15, 23, 42, 0.25);
```

Shadow:

```css
box-shadow:
  -12px 0 32px rgba(15, 23, 42, 0.12);
```

Animation:

```text
Right → Left

250–320ms

cubic-bezier(0.22, 1, 0.36, 1)
```

---

# 30. Tabs

Default:

```css
height: 40px;

font-size: 14px;

font-weight: 500;

color: #64748B;
```

Active:

```css
color: #4F46E5;
```

Indicator:

```css
height: 2px;

background: #4F46E5;
```

Không cần background lớn cho tab nếu sử dụng underline navigation.

---

# 31. Animation

Micro interaction:

```text
150–200ms
```

Drawer/Dialog:

```text
250–320ms
```

Card hover:

```css
transform:
  translateY(-2px);
```

Không dùng:

```text
large scale animation
bounce
large translate
continuous animation
```

trong Dashboard.

Luôn support:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 32. Layout Width

Sidebar:

```text
232px
```

Top Header:

```text
56–64px
```

Main content:

```css
width: 100%;
```

Không giới hạn Dashboard vào container quá nhỏ.

Dashboard cần tận dụng màn hình desktop.

Recommended:

```css
max-width: none;
```

hoặc:

```css
max-width: 1800px;
margin: auto;
```

cho màn hình cực lớn.

---

# 33. Responsive Breakpoints

```text
Mobile
< 640px

Tablet
640–1023px

Desktop
1024–1439px

Large Desktop
>= 1440px
```

Desktop là target chính.

---

# 34. Z-Index

Chuẩn hóa:

```css
--z-base: 0;

--z-sticky: 20;

--z-header: 30;

--z-dropdown: 40;

--z-overlay: 50;

--z-drawer: 60;

--z-modal: 70;

--z-toast: 80;

--z-command: 90;
```

Không sử dụng:

```text
z-index: 99999
```

tùy ý.

---

# 35. Complete CSS Tokens

Có thể dùng làm base:

```css
:root {
  /* Brand */

  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --primary-active: #3730A3;
  --primary-subtle: #EEF2FF;
  --primary-border: #C7D2FE;

  /* Background */

  --background: #F8FAFC;
  --surface: #FFFFFF;
  --surface-secondary: #F8FAFC;
  --surface-muted: #F1F5F9;
  --surface-hover: #F8FAFC;
  --surface-selected: #EEF2FF;

  /* Text */

  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --text-disabled: #CBD5E1;
  --text-inverse: #FFFFFF;

  /* Border */

  --border: #E2E8F0;
  --border-subtle: #F1F5F9;
  --border-strong: #CBD5E1;
  --border-focus: #818CF8;

  /* Semantic */

  --success: #10B981;
  --success-dark: #059669;
  --success-subtle: #D1FAE5;

  --warning: #F59E0B;
  --warning-dark: #D97706;
  --warning-subtle: #FEF3C7;

  --danger: #EF4444;
  --danger-dark: #DC2626;
  --danger-subtle: #FEE2E2;

  --info: #2563EB;
  --info-subtle: #DBEAFE;

  /* Analytics */

  --revenue: #2563EB;
  --expense: #8B5CF6;
  --profit: #10B981;

  /* Typography */

  --font-sans:
    "Inter",
    "Be Vietnam Pro",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  --text-caption: 12px;
  --text-small: 13px;
  --text-body: 14px;
  --text-card-title: 16px;
  --text-section-title: 18px;
  --text-page-title: 28px;
  --text-display: 32px;

  /* Radius */

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Spacing */

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Shadow */

  --shadow-sm:
    0 1px 2px rgba(15, 23, 42, 0.04);

  --shadow-md:
    0 4px 12px rgba(15, 23, 42, 0.08);

  --shadow-lg:
    0 12px 32px rgba(15, 23, 42, 0.12);
}
```

---

# 36. Codex Rules

Khi implement UI WorkHub:

1. Luôn đọc file này trước khi tạo hoặc chỉnh sửa UI.
2. Không tự phát minh color nếu semantic color đã tồn tại.
3. Không sử dụng arbitrary font size.
4. Không sử dụng arbitrary spacing.
5. Không sử dụng arbitrary radius.
6. Ưu tiên design token.
7. Reuse component hiện có.
8. Không tạo duplicate component.
9. Không bọc mọi section trong Card.
10. Typography + spacing phải tạo hierarchy trước border/shadow.
11. Red chỉ dành cho danger, overdue, destructive hoặc critical state.
12. Green chủ yếu dành cho success/positive state.
13. Primary Indigo dành cho action, selection và navigation.
14. Không dùng quá nhiều accent color trên cùng viewport.
15. UI phải nhất quán giữa Dashboard, Projects, Tasks, Employees và Revenue.

---

# 37. Visual Hierarchy Reference

Thứ tự hierarchy:

```text
28px / 700
Dự án

18px / 600
Dự án đang thực hiện

16px / 600
Website thương mại điện tử

14px / 400
Xây dựng nền tảng thương mại điện tử...

13px / 400
12/16 công việc

12px / 500
ĐANG THỰC HIỆN
```

Không giải quyết hierarchy bằng cách tăng font quá lớn.

---

# 38. Core Principle

WorkHub phải tạo cảm giác:

```text
Professional
+
Dense
+
Clean
+
Fast to scan
+
Consistent
```

Tham khảo chất lượng interaction và information density từ:

```text
Linear
Jira
ClickUp
Vercel
Modern SaaS dashboards
```

nhưng không clone trực tiếp sản phẩm nào.

Khi phải lựa chọn giữa:

```text
"trang trí đẹp"
```

và:

```text
"thông tin rõ + dễ thao tác"
```

luôn ưu tiên:

```text
thông tin rõ + dễ thao tác.
```
