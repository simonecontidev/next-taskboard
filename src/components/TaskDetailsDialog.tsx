// src/components/TaskDetailsDialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  IconButton,
  Checkbox,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Todo, SubTask, Priority } from "@/types";

type Props = {
  open: boolean;
  task: Todo | null;
  onClose: () => void;
  onSave: (next: Todo) => void;
  onDelete?: (id: string) => void;
  /** elenco etichette note, sempre array di stringhe */
  knownLabels?: string[];
};

export default function TaskDetailsDialog({
  open,
  task,
  onClose,
  onSave,
  onDelete,
  knownLabels = [],
}: Props) {
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isShort = useMediaQuery("(max-height:700px)");
  const fullScreen = isDownMd || isShort;

  const [draft, setDraft] = React.useState<Todo | null>(null);
  const [newSubtask, setNewSubtask] = React.useState("");

  React.useEffect(() => {
    setDraft(task ? { ...task } : null);
    setNewSubtask("");
  }, [task, open]);

  const updateField = <K extends keyof Todo>(key: K, value: Todo[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const addSubtask = () => {
    const t = newSubtask.trim();
    if (!t) return;
    const st: SubTask = { id: crypto.randomUUID(), title: t, done: false };
    setDraft((prev) => (prev ? { ...prev, subtasks: [...(prev.subtasks ?? []), st] } : prev));
    setNewSubtask("");
  };

  const toggleSubtask = (id: string, done: boolean) => {
    setDraft((prev) =>
      prev
        ? { ...prev, subtasks: (prev.subtasks ?? []).map((s) => (s.id === id ? { ...s, done } : s)) }
        : prev
    );
  };

  const deleteSubtask = (id: string) => {
    setDraft((prev) =>
      prev ? { ...prev, subtasks: (prev.subtasks ?? []).filter((s) => s.id !== id) } : prev
    );
  };

  const handleSave = () => {
    if (!draft) return;
    const normalized: Todo = {
      ...draft,
      priority: (draft.priority ?? "med") as Priority,
      subtasks: draft.subtasks ?? [],
      labels: draft.labels ?? [],
    };
    onSave(normalized);
    onClose();
  };

  const handleDelete = () => {
    if (!draft || !onDelete) return;
    onDelete(draft.id);
    onClose();
  };

  const titleHeight = 64;
  const actionsHeight = 72;
  const contentMaxH = fullScreen ? `calc(100vh - ${titleHeight + actionsHeight}px)` : "auto";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overscrollBehavior: "contain" } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          pr: 3,
          py: 1.75,
          position: fullScreen ? "sticky" : "static",
          top: 0,
          zIndex: 2,
          bgcolor: "background.paper",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        {draft ? "Edit task" : "Task details"}
      </DialogTitle>

      <DialogContent
        dividers={!fullScreen}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          maxHeight: contentMaxH,
          overflowY: "auto",
          borderBottom: fullScreen ? (t) => `1px solid ${t.palette.divider}` : "none",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2.5, md: 3 }}>
          {/* Colonna sinistra */}
          <Stack flex={1} spacing={2}>
            <TextField
              label="Title"
              value={draft?.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ maxLength: 120 }}
            />

            <TextField
              label="Description"
              value={(draft as any)?.description ?? ""}
              onChange={(e) =>
                updateField("description" as keyof Todo, e.target.value as any)
              }
              fullWidth
              size="small"
              multiline
              minRows={3}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  label="Priority"
                  value={(draft?.priority ?? "med") as Priority}
                  onChange={(e) => updateField("priority", e.target.value as Priority)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="med">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Due date"
                type="date"
                size="small"
                value={draft?.dueDate ?? ""}
                onChange={(e) => updateField("dueDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <TextField
              label="Labels (comma separated)"
              size="small"
              value={(draft?.labels ?? []).join(", ")}
              onChange={(e) =>
                updateField(
                  "labels",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="frontend, bug, refactor"
              fullWidth
            />

            {/* suggerimenti etichette note */}
            {knownLabels.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {knownLabels.map((lbl) => (
                  <Chip
                    key={lbl}
                    label={lbl}
                    size="small"
                    onClick={() => {
                      const next = new Set([...(draft?.labels ?? [])]);
                      next.add(lbl);
                      updateField("labels", Array.from(next));
                    }}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          {/* Colonna destra */}
          <Stack flex={1} spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Subtasks
            </Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                id="new-subtask-input"
                size="small"
                fullWidth
                placeholder="Add a subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubtask();
                }}
              />
              <Tooltip title="Add subtask">
                <IconButton color="primary" onClick={addSubtask} aria-label="add-subtask" sx={{ flexShrink: 0 }}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack
              spacing={1.25}
              sx={{
                maxHeight: { xs: 280, sm: 320, md: 360 },
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {(draft?.subtasks ?? []).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No subtasks yet.
                </Typography>
              )}

              {(draft?.subtasks ?? []).map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.12)",
                  }}
                >
                  <Checkbox
                    checked={s.done}
                    onChange={(e) => toggleSubtask(s.id, e.target.checked)}
                    inputProps={{ "aria-label": "toggle-subtask" }}
                    sx={{ mr: 0.5 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: s.done ? "line-through" : "none",
                      color: s.done ? "text.secondary" : "text.primary",
                      pr: 1,
                    }}
                  >
                    {s.title}
                  </Typography>
                  <Tooltip title="Delete subtask">
                    <IconButton size="small" onClick={() => deleteSubtask(s.id)} aria-label="delete-subtask">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.25, sm: 1.75 },
          position: fullScreen ? "sticky" : "static",
          bottom: 0,
          zIndex: 2,
          bgcolor: "background.paper",
          borderTop: fullScreen ? (t) => `1px solid ${t.palette.divider}` : "none",
        }}
      >
        <Box>
          {onDelete && draft && (
            <Tooltip title="Delete task">
              <Button color="error" variant="outlined" onClick={handleDelete} startIcon={<DeleteIcon />} size="small">
                Delete
              </Button>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="text" onClick={onClose} size="small">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!draft || !(draft.title?.trim())} size="small">
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}