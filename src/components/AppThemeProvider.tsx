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
  // parte dal tema di sistema
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(prefersDark ? "dark" : "light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#1976d2" },
          background: { default: mode === "dark" ? "#0f1115" : "#f7f7f7" },
        },
        shape: { borderRadius: 12 },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Toggle in alto a destra */}
      <Box sx={{ position: "fixed", top: 12, right: 12, zIndex: 9999 }}>
        <IconButton
          onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
          aria-label="Toggle theme"
        >
          {mode === "light" ? <DarkMode /> : <LightMode />}
        </IconButton>
      </Box>
      {children}
    </ThemeProvider>
  );
}