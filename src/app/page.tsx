// app/page.tsx (o un layout secondario client-side)
"use client";
import ColorModeProvider, { useColorMode } from "@/components/ColorModeProvider";
import { IconButton, Box } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ToDoContainer from "@/components/ToDoContainer";

export default function Home() {
  return (
    <ColorModeProvider>
      <ToolbarToggle />
      <ToDoContainer />
    </ColorModeProvider>
  );
}

function ToolbarToggle() {
  const { mode, toggle } = useColorMode();
  return (
    <Box sx={{ position: "fixed", top: 12, right: 12, zIndex: 9999 }}>
      <IconButton onClick={toggle} aria-label="Toggle theme">
        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Box>
  );
}