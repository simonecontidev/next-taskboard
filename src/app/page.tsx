"use client";
import { Box, IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useColorMode } from "@/components/ColorModeProvider";
import ToDoContainer from "@/components/ToDoContainer";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <ToDoContainer />
    </>
  );
}

function ThemeToggle() {
  const { mode, toggle } = useColorMode();
  return (
    <Box sx={{ position: "fixed", top: 12, right: 12, zIndex: 9999 }}>
      <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
        <IconButton onClick={toggle} aria-label="Toggle theme" size="small">
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}