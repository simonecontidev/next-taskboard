"use client";

import {
  useState, useEffect, useLayoutEffect, useRef,
  type ChangeEvent, type FormEvent,
} from "react";
import {
  Box, TextField, Button, Stack, Typography,
  Snackbar, Alert, Divider, ButtonGroup, useTheme, Chip,
  Autocomplete
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DndContext, closestCenter, DragEndEvent, PointerSensor, KeyboardSensor,
  useSensors, useSensor,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableTodoItem } from "@/components/SortableTodoItem";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import type { Todo, Priority } from "@/types";
import { loadTodos, saveTodos } from "@/lib/persist";

gsap.registerPlugin(ScrollTrigger);

type Filter = "all" | "active" | "completed";
type DueFilter = "all" | "overdue" | "today" | "upcoming" | "no-due";

export default function ToDoContainer() {
  const theme = useTheme();

  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({ open: false, message: "", severity: "success" });

  // dialog state
  const [editing, setEditing] = useState<Todo | null>(null);

  // ADV FILTERS
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => { setTodos(loadTodos()); }, []);
  useEffect(() => { saveTodos(todos); }, [todos]);

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

  useEffect(() => {
    if (todos.length === 0) return;
    const lastByOrder = [...todos].sort((a, b) => a.order - b.order)[todos.length - 1];
    const el = lastByOrder ? cardsRef.current[lastByOrder.id] : null;
    if (!el) return;
    gsap.fromTo(el, { boxShadow: "0 0 0 rgba(0,0,0,0)", scale: 0.98 }, { boxShadow: "0 6px 24px rgba(0,0,0,0.15)", scale: 1, duration: 0.35, ease: "power2.out" });
  }, [todos.length]);

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

  // QUICK ACTIONS
  function cyclePriority(id: string) {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      const curr = t.priority ?? "med";
      const next = curr === "low" ? "med" : curr === "med" ? "high" : "low";
      return { ...t, priority: next };
    }));
  }

  function setDue(id: string, isoOrNull: string | null) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate: isoOrNull ?? undefined } : t));
  }

  function toggleLabel(id: string, label: string) {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      const set = new Set(t.labels ?? []);
      set.has(label) ? set.delete(label) : set.add(label);
      return { ...t, labels: Array.from(set) };
    }));
  }

  // derived
  const ordered = [...todos].sort((a, b) => a.order - b.order);
  const remaining = todos.filter((t) => !t.completed).length;

  // known labels for menus/filters
  const knownLabels = collectKnownLabels(todos);

  // filtering helpers
  function matchesPriority(t: Todo) {
    if (!priorityFilter.length) return true;
    return priorityFilter.includes(t.priority ?? "med");
  }
  function matchesLabels(t: Todo) {
    if (!labelFilter.length) return true;
    const labels = new Set(t.labels ?? []);
    // match ANY selected label
    return labelFilter.some(l => labels.has(l));
  }
  function matchesDue(t: Todo) {
    if (dueFilter === "all") return true;
    const today = new Date(); today.setHours(0,0,0,0);
    if (!t.dueDate) return dueFilter === "no-due";
    const due = new Date(t.dueDate); due.setHours(0,0,0,0);
    const isOverdue = !t.completed && due.getTime() < today.getTime();
    const isToday = due.getTime() === today.getTime();
    if (dueFilter === "overdue") return isOverdue;
    if (dueFilter === "today") return isToday;
    if (dueFilter === "upcoming") return !isOverdue && !isToday;
    return true;
  }

  const baseFiltered =
    filter === "active" ? ordered.filter((t) => !t.completed)
    : filter === "completed" ? ordered.filter((t) => t.completed)
    : ordered;

  const filteredList = baseFiltered.filter(t => matchesPriority(t) && matchesLabels(t) && matchesDue(t));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((t) => t.id === active.id);
    const newIndex = ordered.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(ordered, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
    setTodos(moved);
  }

  const activeFilterSx = {
    bgcolor: theme.palette.common.white + " !important",
    color: theme.palette.common.black + " !important",
    borderColor: theme.palette.divider + " !important",
    "&:hover": { bgcolor: theme.palette.grey[100] + " !important" },
  } as const;

  return (
    <Box ref={rootRef} sx={{ maxWidth: 980, mx: "auto", p: 3, minHeight: "100vh" }}>
      <Typography className="jt-title" variant="h2" sx={{ mb: 4, fontWeight: 600, textAlign: "center", mt: 2 }}>
        Next Taskboard
      </Typography>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} className="jt-form" sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField label="New task" value={input} onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} fullWidth autoComplete="off" />
        <Button type="submit" variant="contained" color="primary" disabled={!input.trim()}>Add</Button>
        <Button variant="outlined" color="error" onClick={() => setTodos([])} disabled={todos.length === 0}>Clear All</Button>
      </Box>

      {/* Counter + Filtri base */}
      <Box sx={{ mt: 1.5, display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography variant="subtitle2" color="text.secondary">
          {todos.length === 0 ? "No tasks yet" : `${remaining} remaining • ${todos.length} total`}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
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
        </Box>
      </Box>

      {/* Filtri avanzati */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <Autocomplete
          multiple
          options={["low","med","high"] as Priority[]}
          value={priorityFilter}
          onChange={(_, v) => setPriorityFilter(v)}
          renderInput={(params) => <TextField {...params} size="small" label="Priority filter" placeholder="Select priorities" />}
          sx={{ minWidth: 220, flex: 1 }}
        />
        <Autocomplete
          multiple
          freeSolo
          options={knownLabels}
          value={labelFilter}
          onChange={(_, v) => setLabelFilter(v)}
          renderInput={(params) => <TextField {...params} size="small" label="Label filter" placeholder="Select labels" />}
          sx={{ minWidth: 260, flex: 2 }}
        />
        <ButtonGroup size="small" variant="outlined" sx={{ flexWrap: "wrap" }}>
          {(["all","overdue","today","upcoming","no-due"] as DueFilter[]).map(df => (
            <Button key={df} onClick={() => setDueFilter(df)} variant={dueFilter === df ? "contained" : "outlined"} sx={dueFilter === df ? activeFilterSx : undefined}>
              {df.toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={filteredList.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={1.25}>
            <AnimatePresence>
              {filteredList.map((todo) => (
                <motion.div key={todo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                  <SortableTodoItem
                    todo={todo}
                    knownLabels={knownLabels}
                    setRef={(el) => (cardsRef.current[todo.id] = el)}
                    onToggleCompleted={() => toggleCompleted(todo.id)}
                    onEdit={() => setEditing(todo)}
                    onDelete={() => handleDeleteOne(todo.id)}
                    onCyclePriority={() => cyclePriority(todo.id)}
                    onSetDue={(iso) => setDue(todo.id, iso)}
                    onToggleLabel={(label) => toggleLabel(todo.id, label)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        </SortableContext>
      </DndContext>

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
        onSave={(next) => onSaveTask(next)}
        knownLabels={knownLabels}
      />
    </Box>
  );
}

function collectKnownLabels(list: Todo[]): string[] {
  const s = new Set<string>();
  for (const t of list) (t.labels ?? []).forEach(l => s.add(l));
  return Array.from(s).slice(0, 50);
}