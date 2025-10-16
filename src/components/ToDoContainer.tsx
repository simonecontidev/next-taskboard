"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Box, TextField, Button, Typography, Stack, Paper } from "@mui/material";

export default function ToDoContainer() {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<string[]>([]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setTodos((prev) => [...prev, title]);
    setInput("");
  }

  return (
    <Box component="section" sx={{ maxWidth: 520 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>To-Do</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1 }}>
        <TextField
          label="New task"
          value={input}
          onChange={handleChange}
          fullWidth
        />
        <Button type="submit" variant="contained">Add</Button>
      </Box>

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {todos.map((todo, idx) => (
          <Paper key={`${todo}-${idx}`} sx={{ p: 1.5 }}>
            {todo}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}