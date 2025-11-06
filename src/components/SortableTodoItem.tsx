"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Paper, Box, Checkbox, IconButton, Typography, Tooltip, Chip, LinearProgress, Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LabelIcon from "@mui/icons-material/Label";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlagIcon from "@mui/icons-material/Flag";
import type { Todo } from "@/types";

type Props = {
  todo: Todo;
  setRef: (node: HTMLDivElement | null) => void;
  onToggleCompleted: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function pctDone(todo: Todo) {
  const list = todo.subtasks ?? [];
  if (!list.length) return null;
  const done = list.filter(s => s.done).length;
  return Math.round((done / list.length) * 100);
}

function dueStatus(todo: Todo) {
  if (!todo.dueDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(todo.dueDate); due.setHours(0,0,0,0);
  const overdue = !todo.completed && due.getTime() < today.getTime();
  return { overdue, dueText: todo.dueDate };
}

const priorityColor: Record<NonNullable<Todo["priority"]>, "default" | "success" | "warning" | "error"> = {
  low: "success",
  med: "warning",
  high: "error",
};

function SortableTodoItemBase({ todo, setRef, onToggleCompleted, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    outline: isDragging ? "1px dashed var(--mui-palette-divider)" : undefined,
    borderRadius: 12,
    cursor: "grab",
  };

  const progress = pctDone(todo);
  const due = dueStatus(todo);

  return (
    <Paper
      elevation={1}
      className="jt-card"
      ref={(node) => { setNodeRef(node); setRef(node); }}
      style={style}
      sx={{
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
      {...attributes}
      {...listeners}
    >
      {/* riga principale */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Checkbox checked={todo.completed} onChange={onToggleCompleted} inputProps={{ "aria-label": `Mark ${todo.title} as completed` }} />

        <Typography
          sx={{
            flex: 1,
            userSelect: "none",
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "text.secondary" : "text.primary",
            fontWeight: 500,
          }}
          title={todo.title}
          noWrap
        >
          {todo.title}
        </Typography>

        <Tooltip title="Edit">
          <IconButton aria-label={`Edit ${todo.title}`} onClick={onEdit}><EditIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton aria-label={`Delete ${todo.title}`} onClick={onDelete}><DeleteIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* meta: priority, due, labels */}
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
        <Chip
          size="small"
          icon={<FlagIcon />}
          label={(todo.priority ?? "med").toUpperCase()}
          color={priorityColor[todo.priority ?? "med"]}
          variant="outlined"
        />
        {due && (
          <Chip
            size="small"
            icon={<AccessTimeIcon />}
            label={due.dueText}
            color={due.overdue ? "error" : "default"}
            variant={due.overdue ? "filled" : "outlined"}
          />
        )}
        {(todo.labels ?? []).map((l) => (
          <Chip key={l} size="small" icon={<LabelIcon />} label={l} variant="outlined" />
        ))}
      </Stack>

      {/* checklist progress */}
      {progress !== null && (
        <Box sx={{ px: 5 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">{progress}%</Typography>
        </Box>
      )}
    </Paper>
  );
}

export const SortableTodoItem = memo(SortableTodoItemBase);