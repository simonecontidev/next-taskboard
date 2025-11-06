// src/theme.ts
import { createTheme } from "@mui/material/styles";

// Tema base (puoi personalizzare palette/typography)
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#111111" },
    secondary: { main: "#6C5CE7" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

export default theme;