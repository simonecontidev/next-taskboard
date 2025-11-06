import { createTheme } from "@mui/material/styles";
export type Mode = "light" | "dark";

export default function getTheme(mode: Mode) {
  const isDark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? "#a5b4fc" : "#111111" },
      secondary: { main: isDark ? "#60a5fa" : "#6C5CE7" },
      background: {
        default: isDark ? "#0b0b0e" : "#fafafa",
        paper:   isDark ? "#121316" : "#ffffff",
      },
      text: {
        primary:   isDark ? "#e6e6e6" : "#111111",
        secondary: isDark ? "#b8b8b8" : "#5e5e5e",
      },
      divider: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
          "*": {
            transition: "background-color .2s ease, color .2s ease, border-color .2s ease",
          },
        }),
      },
      MuiPaper: {
        defaultProps: { elevation: 1 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
    },
    shape: { borderRadius: 12 },
  });
}