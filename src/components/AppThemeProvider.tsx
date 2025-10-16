"use client";

import { useMemo, useState, PropsWithChildren } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Box,
  useMediaQuery,
} from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";

export default function AppThemeProvider({ children }: PropsWithChildren) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(prefersDark ? "dark" : "light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "dark" ? "#0d0d0d" : "#fafafa",
            paper: mode === "dark" ? "#141414" : "#ffffff",
          },
          primary: {
            main: mode === "dark" ? "#ffffff" : "#000000",
            contrastText: mode === "dark" ? "#000000" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#ffffff" : "#000000",
            secondary: mode === "dark" ? "#b3b3b3" : "#555555",
          },
        },
        shape: { borderRadius: 10 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 10,
                fontWeight: 500,
                borderWidth: 1,
                "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                transition: "all 0.2s ease",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: "fixed", top: 12, right: 12, zIndex: 9999 }}>
        <IconButton
          onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
          aria-label="Toggle theme"
          color="inherit"
        >
          {mode === "light" ? <DarkMode /> : <LightMode />}
        </IconButton>
      </Box>
      {children}
    </ThemeProvider>
  );
}