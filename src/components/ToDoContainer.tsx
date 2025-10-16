"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
  Checkbox,
  ButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

type Filter = "all" | "active" | "completed";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

export default function ToDoContainer() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({ open: false, message: "", severity: "success" });

  // editing inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  /* -----------------------------
     1) Persistenza localStorage
  ------------------------------*/
  useEffect(() => {
    const saved = localStorage.getItem("next-taskboard/todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("next-taskboard/todos", JSON.stringify(todos));
  }, [todos]);

  /* -----------------------------
     Handlers base
  ------------------------------*/
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() },
    ]);
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

  /* -----------------------------
     2) Toggle completed
  ------------------------------*/
  function toggleCompleted(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  /* -----------------------------
     3) Filtri + Clear completed
  ------------------------------*/
  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
    setSnackbar({ open: true, message: "Completed tasks cleared", severity: "info" });
  }

  /* -----------------------------
     4) Edit inline (UX)
  ------------------------------*/
  function startEdit(id: string, currentTitle: string) {
    setEditingId(id);
    setEditValue(currentTitle);
  }

  function confirmEdit(id: string) {
    const v = editValue.trim();
    if (!v) return cancelEdit();
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title: v } : t)));
    setEditingId(null);
    setEditValue("");
    setSnackbar({ open: true, message: "Task updated", severity: "success" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, minHeight: "100vh" }}>
      <Typography variant="h2" sx={{ mb: 4, fontWeight: 600, textAlign: "center", mt: 2 }}>
        Next Taskboard
      </Typography>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="New task"
          value={input}
          onChange={handleChange}
          fullWidth
          autoComplete="off"
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

      {/* Counter + Filtri + Clear completed */}
      <Box
        sx={{
          mt: 1.5,
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {todos.length === 0
            ? "No tasks yet"
            : `${remaining} remaining • ${todos.length} total`}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "contained" : "outlined"}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter("active")}
              variant={filter === "active" ? "contained" : "outlined"}
            >
              Active
            </Button>
            <Button
              onClick={() => setFilter("completed")}
              variant={filter === "completed" ? "contained" : "outlined"}
            >
              Completed
            </Button>
          </ButtonGroup>

          <Button
            size="small"
            onClick={clearCompleted}
            disabled={!todos.some((t) => t.completed)}
          >
            Clear completed
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Empty state */}
      {todos.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary", opacity: 0.9 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Your mind is clear.
          </Typography>
          <Typography variant="body2">Add your first thought 🌱</Typography>
        </Box>
      )}

      {/* Lista con animazioni + completed + edit inline */}
      <Stack spacing={1.25}>
        <AnimatePresence>
          {filtered.map((todo) => {
            const isEditing = editingId === todo.id;
            return (
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
                    gap: 1,
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => toggleCompleted(todo.id)}
                      inputProps={{ "aria-label": `Mark ${todo.title} as completed` }}
                    />

                    {isEditing ? (
                      <Box component="form" onSubmit={(e) => { e.preventDefault(); confirmEdit(todo.id); }} sx={{ flex: 1, display: "flex", gap: 1 }}>
                        <TextField
                          autoFocus
                          size="small"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") cancelEdit();
                          }}
                          fullWidth
                        />
                        <IconButton aria-label="Confirm" onClick={() => confirmEdit(todo.id)}>
                          <CheckIcon />
                        </IconButton>
                        <IconButton aria-label="Cancel" onClick={cancelEdit}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography
                        onDoubleClick={() => startEdit(todo.id, todo.title)}
                        sx={{
                          flex: 1,
                          userSelect: "none",
                          textDecoration: todo.completed ? "line-through" : "none",
                          color: todo.completed ? "text.secondary" : "text.primary",
                        }}
                      >
                        {todo.title}
                      </Typography>
                    )}
                  </Box>

                  {!isEditing && (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        aria-label={`Edit ${todo.title}`}
                        onClick={() => startEdit(todo.id, todo.title)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${todo.title}`}
                        onClick={() => handleDeleteOne(todo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Stack>

      {/* Snackbar */}
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