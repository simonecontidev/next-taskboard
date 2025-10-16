"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion, AnimatePresence, color } from "framer-motion";

type Todo = { id: string; title: string };

export default function ToDoContainer() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), title }]);
    setInput("");
    setSnackbar({ open: true, message: "Task added", severity: "success" });
  }

  function handleDeleteOne(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSnackbar({ open: true, message: "Task deleted", severity: "info" });
  }

  function handleClearAll() {
    setTodos([]);
    setSnackbar({ open: true, message: "All tasks cleared", severity: "warning" });
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, height: "100vh" }}>
      <Typography variant="h2" sx={{ mb: 20, fontWeight: 600, textAlign: "center", mt: 4 }}>
        Next Taskboard
      </Typography>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 1 }}
      >
        <TextField
          label="New task"
          value={input}
          onChange={handleChange}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearAll}
          disabled={todos.length === 0}
        >
          Clear All
        </Button>
      </Box>

      {/* Counter */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1.5 }}>
        {todos.length === 0
          ? "No tasks yet"
          : `${todos.length} task${todos.length > 1 ? "s" : ""} total`}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Empty state (poetico/illustrato) */}
      {todos.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            mt: 6,
            color: "text.secondary",
            opacity: 0.9,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Your mind is clear.
          </Typography>
          <Typography variant="body2">Add your first thought 🌱</Typography>
        </Box>
      )}

      {/* Lista con animazioni */}
      <Stack spacing={1.25}>
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                <Typography>{todo.title}</Typography>
                <IconButton
                  aria-label={`Delete ${todo.title}`}
                  onClick={() => handleDeleteOne(todo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={1800}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}