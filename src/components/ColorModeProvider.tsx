// src/components/ColorModeProvider.tsx
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import baseTheme from "@/theme";

type Ctx = { mode: "light" | "dark"; toggle: () => void };
const Ctx = createContext<Ctx | null>(null);

export function useColorMode() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useColorMode must be used within ColorModeProvider");
  return v;
}

export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">("light");

  // hydra-safe: leggi localStorage solo client-side
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("color-mode")) as "light" | "dark" | null;
    setMode(saved ?? (prefersDark ? "dark" : "light"));
  }, [prefersDark]);

  const theme = useMemo(
    () => createTheme({ ...baseTheme, palette: { ...baseTheme.palette, mode } }),
    [mode]
  );

  const value = useMemo<Ctx>(() => ({
    mode,
    toggle: () => {
      setMode((m) => {
        const next = m === "light" ? "dark" : "light";
        localStorage.setItem("color-mode", next);
        return next;
      });
    },
  }), []);

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Ctx.Provider>
  );
}