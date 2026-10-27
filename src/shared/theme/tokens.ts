export const designTokens = {
  colors: {
    primary: "#4F46E5", primaryHover: "#4338CA", primaryActive: "#3730A3", primarySubtle: "#EEF2FF", primaryBorder: "#C7D2FE",
    background: "#F8FAFC", surface: "#FFFFFF", surfaceSecondary: "#F8FAFC", surfaceMuted: "#F1F5F9", surfaceHover: "#F8FAFC", surfaceSelected: "#EEF2FF",
    textPrimary: "#0F172A", textSecondary: "#475569", textMuted: "#94A3B8", textDisabled: "#CBD5E1", textInverse: "#FFFFFF",
    border: "#E2E8F0", borderSubtle: "#F1F5F9", borderStrong: "#CBD5E1", borderFocus: "#818CF8",
    sidebarBackground: "#111827", sidebarSurface: "#1F2937", sidebarHover: "#1E293B", sidebarActive: "#334155", sidebarText: "#CBD5E1", sidebarIcon: "#94A3B8", sidebarIconActive: "#818CF8",
    success: "#10B981", successDark: "#059669", successSubtle: "#D1FAE5", successBackground: "#ECFDF5", warning: "#F59E0B", warningDark: "#D97706", warningSubtle: "#FEF3C7", warningBackground: "#FFFBEB", danger: "#EF4444", dangerDark: "#DC2626", dangerSubtle: "#FEE2E2", dangerBackground: "#FEF2F2", info: "#2563EB", infoSubtle: "#DBEAFE", infoBackground: "#EFF6FF",
    revenue: "#2563EB", revenueLight: "#DBEAFE", expense: "#8B5CF6", expenseLight: "#EDE9FE", profit: "#10B981", profitLight: "#D1FAE5",
  },
  typography: { display: [32, 40], pageTitle: [28, 36], sectionTitle: [18, 26], cardTitle: [16, 24], body: [14, 20], small: [13, 18], caption: [12, 16] },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(15, 23, 42, .04)", md: "0 4px 12px rgba(15, 23, 42, .08)", lg: "0 12px 32px rgba(15, 23, 42, .12)" },
  motion: { fast: "150ms", normal: "200ms", drawer: "280ms" },
} as const;
