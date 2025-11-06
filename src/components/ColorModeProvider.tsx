"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import getTheme from "@/theme";

type Mode = "light" | "dark";
type Ctx = { mode: Mode; toggle: () => void };
const Ctx = createContext<Ctx | null>(null);
export const useColorMode = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useColorMode must be used within ColorModeProvider");
  return v;
};

export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("color-mode")) as Mode | null;
    setMode(saved ?? (prefersDark ? "dark" : "light"));
  }, [prefersDark]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo<Ctx>(() => ({
    mode,
    toggle: () => {
      setMode(m => {
        const next = m === "light" ? "dark" : "light";
        localStorage.setItem("color-mode", next);
        return next;
      });
    }
  }), []);

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}