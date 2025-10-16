"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Typography,
  Checkbox,
  Divider,
} from "@mui/material";

type Todo = { id: string; title: string; selected: boolean };

export default function ToDoContainer() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), title, selected: false }]);
    setInput("");
  }

  function toggleSelect(id: string) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, selected: !todo.selected } : todo
      )
    );
  }

  function handleDeleteSelected() {
    setTodos((prev) => prev.filter((t) => !t.selected));
  }

  function handleClearAll() {
    setTodos([]);
  }

  return (
    <Box sx={{ maxWidth: 560, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        To-Do
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 1, alignItems: "center" }}
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
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.25}>
        {todos.map((todo) => (
          <Paper
            key={todo.id}
            sx={{
              p: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: todo.selected ? "rgba(255,0,0,0.05)" : "inherit",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={todo.selected}
                onChange={() => toggleSelect(todo.id)}
              />
              <Typography
                sx={{
                  textDecoration: todo.selected ? "line-through" : "none",
                  color: todo.selected ? "text.secondary" : "text.primary",
                }}
              >
                {todo.title}
              </Typography>
            </Box>
          </Paper>
        ))}

        {todos.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nessuna task. Aggiungine una per iniziare.
          </Typography>
        )}
      </Stack>

      {todos.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteSelected}
            disabled={!todos.some((t) => t.selected)}
            // startIcon={<DeleteIcon />} --- IGNORE ---
          >
            Delete selected
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleClearAll}
            disabled={todos.length === 0}
          >
            Clear all
          </Button>
        </Box>
      )}
    </Box>
  );
}