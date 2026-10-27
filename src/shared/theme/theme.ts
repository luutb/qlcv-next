import { createTheme } from "@mui/material/styles";
import { designTokens } from "./tokens";

export const qlcvTheme = createTheme({
  palette: {
    primary: { main: designTokens.colors.primary, dark: designTokens.colors.primaryActive, light: designTokens.colors.primarySubtle, contrastText: designTokens.colors.textInverse },
    secondary: { main: designTokens.colors.warningDark, contrastText: designTokens.colors.textInverse },
    background: { default: designTokens.colors.background, paper: designTokens.colors.surface },
    text: { primary: designTokens.colors.textPrimary, secondary: designTokens.colors.textSecondary, disabled: designTokens.colors.textDisabled },
    divider: designTokens.colors.border,
    error: { main: designTokens.colors.danger, dark: designTokens.colors.dangerDark, light: designTokens.colors.dangerSubtle },
    success: { main: designTokens.colors.success, dark: designTokens.colors.successDark, light: designTokens.colors.successSubtle },
    warning: { main: designTokens.colors.warning, dark: designTokens.colors.warningDark, light: designTokens.colors.warningSubtle },
    info: { main: designTokens.colors.info, light: designTokens.colors.infoSubtle },
  },
  shape: { borderRadius: designTokens.radius.md },
  typography: { fontFamily: "var(--font-body), sans-serif", h1: { fontFamily: "var(--font-body), sans-serif", fontSize: 28, lineHeight: "36px", fontWeight: 700 }, h2: { fontFamily: "var(--font-body), sans-serif", fontSize: 18, lineHeight: "26px", fontWeight: 600 }, h3: { fontFamily: "var(--font-body), sans-serif", fontSize: 16, lineHeight: "24px", fontWeight: 600 }, button: { textTransform: "none", fontWeight: 500 } },
});
