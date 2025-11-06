"use client";

import { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Chip, IconButton, Typography, Box, Autocomplete, MenuItem, Select, InputLabel, FormControl, Checkbox as MUICheckbox
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Todo, SubTask, Priority } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  task: Todo | null;
  onSave: (next: Todo) => void;
  knownLabels?: string[]; // per suggerimenti
};

const PRIORITIES: Priority[] = ["low", "med", "high"];

export default function TaskDetailsDialog({ open, onClose, task, onSave, knownLabels = [] }: Props) {
  const [draft, setDraft] = useState<Todo | null>(task);

  // sync quando cambia task
  useMemo(() => setDraft(task), [task]);

  if (!draft) return null;

  const labelsAll = Array.from(new Set([...(draft.labels ?? []), ...knownLabels])).slice(0, 20);

  function addSubtask() {
    const title = (document.getElementById("new-subtask-input") as HTMLInputElement | null)?.value?.trim();
    if (!title) return;
    const st: SubTask = { id: crypto.randomUUID(), title, done: false };
    const next = { ...draft, subtasks: [...(draft.subtasks ?? []), st] };
    setDraft(next);
    (document.getElementById("new-subtask-input") as HTMLInputElement | null)!.value = "";
  }

  function updateSubtask(id: string, patch: Partial<SubTask>) {
    const next = {
      ...draft,
      subtasks: (draft.subtasks ?? []).map(s => s.id === id ? { ...s, ...patch } : s),
    };
    setDraft(next);
  }

  function removeSubtask(id: string) {
    const next = { ...draft, subtasks: (draft.subtasks ?? []).filter(s => s.id !== id) };
    setDraft(next);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit task</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                value={draft.priority ?? "med"}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p.toUpperCase()}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              label="Due date"
              type="date"
              fullWidth
              value={draft.dueDate ?? ""}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Autocomplete
            multiple
            freeSolo
            options={labelsAll}
            value={draft.labels ?? []}
            onChange={(_, value) => setDraft({ ...draft, labels: value })}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => <TextField {...params} label="Labels" placeholder="Add label" />}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Checklist</Typography>
            <Stack spacing={1}>
              {(draft.subtasks ?? []).map((s) => (
                <Stack key={s.id} direction="row" alignItems="center" spacing={1}>
                  <MUICheckbox checked={s.done} onChange={() => updateSubtask(s.id, { done: !s.done })} />
                  <TextField
                    size="small"
                    value={s.title}
                    onChange={(e) => updateSubtask(s.id, { title: e.target.value })}
                    fullWidth
                  />
                  <IconButton onClick={() => removeSubtask(s.id)} aria-label="Delete subtask"><DeleteIcon /></IconButton>
                </Stack>
              ))}
              <Stack direction="row" spacing={1}>
                <TextField id="new-subtask-input" size="small" placeholder="New subtask…" fullWidth />
                <Button startIcon={<AddIcon />} onClick={addSubtask} variant="outlined">Add</Button>
              </Stack>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <MUICheckbox
              checked={draft.completed}
              onChange={() => setDraft({ ...draft, completed: !draft.completed })}
            />
            <Typography>Mark as completed</Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => { onSave({ ...draft, title: draft.title.trim() || draft.title }); onClose(); }}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}