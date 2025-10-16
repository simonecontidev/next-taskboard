import { Box } from "@mui/material";
import ToDoContainer from "../components/ToDoContainer";

export default function Home() {
  return (
    <Box sx={{ p: 3 }}>
      <ToDoContainer />
    </Box>
  );
}