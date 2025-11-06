"use client";

import {
  useState, useEffect, useLayoutEffect, useRef,
  type ChangeEvent, type FormEvent, type MouseEvent,
} from "react";
import {
  Box, TextField, Button, Stack, Typography,
  Snackbar, Alert, Divider, ButtonGroup, useTheme, Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// DnD Kit
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
// Se lo hai installato: import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableTodoItem } from "@/components/SortableTodoItem";

import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import type { Todo } from "@/types";
import { loadTodos, saveTodos } from "@/lib/persist";

gsap.registerPlugin(ScrollTrigger);

type Filter = "all" | "active" | "completed";

export default function ToDoContainer() {
  const theme = useTheme();

  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({ open: false, message: "", severity: "success" });

  // dialog state
  const [editing, setEditing] = useState<Todo | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  // boot
  useEffect(() => { setTodos(loadTodos()); }, []);
  useEffect(() => { saveTodos(todos); }, [todos]);

  // entrance animations
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".jt-title", { y: 24, opacity: 0, duration: 0.6, ease: "power2.out" });
      gsap.from(".jt-form > *", { y: 12, opacity: 0, stagger: 0.06, duration: 0.4, ease: "power2.out", delay: 0.1 });
      gsap.utils.toArray<HTMLElement>(".jt-card").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 16, duration: 0.3, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // highlight last by order
  useEffect(() => {
    if (todos.length === 0) return;
    const lastByOrder = [...todos].sort((a, b) => a.order - b.order)[todos.length - 1];
    const el = lastByOrder ? cardsRef.current[lastByOrder.id] : null;
    if (!el) return;
    gsap.fromTo(el, { boxShadow: "0 0 0 rgba(0,0,0,0)", scale: 0.98 }, { boxShadow: "0 6px 24px rgba(0,0,0,0.15)", scale: 1, duration: 0.35, ease: "power2.out" });
  }, [todos.length]);

  // form
  function handleChange(e: ChangeEvent<HTMLInputElement>) { setInput(e.target.value); }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;

    const next: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
      order: 0,
      priority: "med",
      labels: [],
      subtasks: [],
    };
    const reindexed = [next, ...todos.map((t, i) => ({ ...t, order: i + 1 }))];
    setTodos(reindexed);
    setInput("");
    setSnackbar({ open: true, message: "Task added", severity: "success" });
  }

  function handleDeleteOne(id: string) {
    const filtered = todos.filter((t) => t.id !== id);
    const reindexed = filtered.map((t, i) => ({ ...t, order: i }));
    setTodos(reindexed);
    setSnackbar({ open: true, message: "Task deleted", severity: "info" });
  }

  function toggleCompleted(id: string) {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTodos(updated);
  }

  function clearCompleted() {
    const filtered = todos.filter((t) => !t.completed);
    const reindexed = filtered.map((t, i) => ({ ...t, order: i }));
    setTodos(reindexed);
    setSnackbar({ open: true, message: "Completed tasks cleared", severity: "info" });
  }

  function onSaveTask(next: Todo) {
    setTodos(prev => prev.map(t => t.id === next.id ? next : t));
    setSnackbar({ open: true, message: "Task updated", severity: "success" });
  }

  // derived
  const ordered = [...todos].sort((a, b) => a.order - b.order);
  const filteredList =
    filter === "active" ? ordered.filter((t) => !t.completed)
    : filter === "completed" ? ordered.filter((t) => t.completed)
    : ordered;

  const remaining = todos.filter((t) => !t.completed).length;

  const activeFilterSx = {
    bgcolor: theme.palette.common.white + " !important",
    color: theme.palette.common.black + " !important",
    borderColor: theme.palette.divider + " !important",
    "&:hover": { bgcolor: theme.palette.grey[100] + " !important" },
  } as const;

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((t) => t.id === active.id);
    const newIndex = ordered.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(ordered, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
    setTodos(moved);
  }

  return (
    <Box ref={rootRef} sx={{ maxWidth: 800, mx: "auto", p: 3, minHeight: "100vh" }}>
      <Typography className="jt-title" variant="h2" sx={{ mb: 4, fontWeight: 600, textAlign: "center", mt: 2 }}>
        Next Taskboard
      </Typography>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} className="jt-form" sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField label="New task" value={input} onChange={handleChange} fullWidth autoComplete="off" />
        <Button type="submit" variant="contained" color="primary" disabled={!input.trim()}>
          Add
        </Button>
        <Button variant="outlined" color="error" onClick={() => setTodos([])} disabled={todos.length === 0}>
          Clear All
        </Button>
      </Box>

      {/* Counter + Filtri */}
      <Box sx={{ mt: 1.5, display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography variant="subtitle2" color="text.secondary">
          {todos.length === 0 ? "No tasks yet" : `${remaining} remaining • ${todos.length} total`}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <ButtonGroup size="small" variant="outlined">
            <Button onClick={() => setFilter("all")} variant={filter === "all" ? "contained" : "outlined"} sx={filter === "all" ? activeFilterSx : undefined}>
              All
            </Button>
            <Button onClick={() => setFilter("active")} variant={filter === "active" ? "contained" : "outlined"} sx={filter === "active" ? activeFilterSx : undefined}>
              Active
            </Button>
            <Button onClick={() => setFilter("completed")} variant={filter === "completed" ? "contained" : "outlined"} sx={filter === "completed" ? activeFilterSx : undefined}>
              Completed
            </Button>
          </ButtonGroup>

          <Button size="small" onClick={clearCompleted} disabled={!todos.some((t) => t.completed)}>
            Clear completed
          </Button>
        </Box>
      </Box>

      {/* Hint DnD */}
      <Box sx={{ mt: 1 }}>
        <Chip
          label={filter === "all" ? "Drag & drop enabled (All)" : "Reorder available only in All"}
          size="small"
          color={filter === "all" ? "primary" : "default"}
          variant={filter === "all" ? "filled" : "outlined"}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Empty state */}
      {todos.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary", opacity: 0.9 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>Your mind is clear.</Typography>
          <Typography variant="body2">Add your first thought 🌱</Typography>
        </Box>
      )}

      {/* Lista */}
      {filter === "all" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          {/* se hai installato i modifiers:
              modifiers={[restrictToVerticalAxis]} */}
          <SortableContext items={ordered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <Stack spacing={1.25}>
              <AnimatePresence>
                {ordered.map((todo) => (
                  <motion.div key={todo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                    <SortableTodoItem
                      todo={todo}
                      setRef={(el) => (cardsRef.current[todo.id] = el)}
                      onToggleCompleted={() => toggleCompleted(todo.id)}
                      onEdit={() => setEditing(todo)}
                      onDelete={() => handleDeleteOne(todo.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </SortableContext>
        </DndContext>
      ) : (
        <Stack spacing={1.25}>
          <AnimatePresence>
            {filteredList.map((todo) => (
              <motion.div key={todo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                <SortableTodoItem
                  todo={todo}
                  setRef={(el) => (cardsRef.current[todo.id] = el)}
                  onToggleCompleted={() => toggleCompleted(todo.id)}
                  onEdit={() => setEditing(todo)}
                  onDelete={() => handleDeleteOne(todo.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={1800} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog edit */}
      <TaskDetailsDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        task={editing}
        onSave={onSaveTask}
        knownLabels={collectKnownLabels(todos)}
      />
    </Box>
  );
}

// helpers
function collectKnownLabels(list: Todo[]): string[] {
  const s = new Set<string>();
  for (const t of list) (t.labels ?? []).forEach(l => s.add(l));
  return Array.from(s).slice(0, 30);
}