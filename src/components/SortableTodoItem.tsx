"use client";

import { memo, useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Paper, Box, Checkbox, IconButton, Typography, Tooltip, Chip, LinearProgress, Stack,
  Menu, MenuItem, ListItemIcon, ListItemText, Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LabelIcon from "@mui/icons-material/Label";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlagIcon from "@mui/icons-material/Flag";
import TodayIcon from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ClearIcon from "@mui/icons-material/Clear";
import type { Todo } from "@/types";

type Props = {
  todo: Todo;
  knownLabels: string[];
  setRef: (node: HTMLDivElement | null) => void;
  onToggleCompleted: () => void;
  onEdit: () => void;
  onDelete: () => void;

  // quick actions
  onCyclePriority: () => void;
  onSetDue: (isoOrNull: string | null) => void;
  onToggleLabel: (label: string) => void;
};

function pctDone(todo: Todo) {
  const list = todo.subtasks ?? [];
  if (!list.length) return null;
  const done = list.filter(s => s.done).length;
  return Math.round((done / list.length) * 100);
}

function dueStatus(todo: Todo) {
  if (!todo.dueDate) return { kind: "none" as const, dueText: null, overdue: false, today: false };
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(todo.dueDate); due.setHours(0,0,0,0);
  const overdue = !todo.completed && due.getTime() < today.getTime();
  const todayMatch = due.getTime() === today.getTime();
  return { kind: "some" as const, dueText: todo.dueDate, overdue, today: todayMatch };
}

const priorityColor: Record<NonNullable<Todo["priority"]>, "default" | "success" | "warning" | "error"> = {
  low: "success",
  med: "warning",
  high: "error",
};

function isoDaysFromNow(days: number) {
  const d = new Date(); d.setHours(0,0,0,0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

function SortableTodoItemBase({
  todo, knownLabels, setRef,
  onToggleCompleted, onEdit, onDelete,
  onCyclePriority, onSetDue, onToggleLabel,
}: Props) {
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

  // Menù due
  const [dueAnchor, setDueAnchor] = useState<null | HTMLElement>(null);
  const openDue = (e: React.MouseEvent<HTMLElement>) => setDueAnchor(e.currentTarget);
  const closeDue = () => setDueAnchor(null);

  // Menù labels
  const [labelsAnchor, setLabelsAnchor] = useState<null | HTMLElement>(null);
  const openLabels = (e: React.MouseEvent<HTMLElement>) => setLabelsAnchor(e.currentTarget);
  const closeLabels = () => setLabelsAnchor(null);

  const labelsSet = useMemo(() => new Set(todo.labels ?? []), [todo.labels]);

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

      {/* meta + quick actions */}
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
        {/* PRIORITY quick cycle */}
        <Chip
          size="small"
          icon={<FlagIcon />}
          label={(todo.priority ?? "med").toUpperCase()}
          color={priorityColor[todo.priority ?? "med"]}
          variant="outlined"
          onClick={onCyclePriority}
          title="Change priority"
          sx={{ cursor: "pointer" }}
        />

        {/* DUE quick menu */}
      <Chip
  size="small"
  icon={<AccessTimeIcon />}
  label={due.kind === "some" ? due.dueText! : "No due"}
  // ⚠️ sempre una stringa valida per color:
  color={
    due.kind === "some"
      ? (due.overdue ? "error" : due.today ? "warning" : "default")
      : "default"
  }
  // ⚠️ sempre una stringa valida per variant:
  variant={due.kind === "some" && due.overdue ? "filled" : "outlined"}
  onClick={openDue}
  sx={{ cursor: "pointer" }}
/>
        <Menu anchorEl={dueAnchor} open={Boolean(dueAnchor)} onClose={closeDue}>
          <MenuItem onClick={() => { onSetDue(isoDaysFromNow(0)); closeDue(); }}>
            <ListItemIcon><TodayIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Today</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onSetDue(isoDaysFromNow(1)); closeDue(); }}>
            <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Tomorrow</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onSetDue(isoDaysFromNow(7)); closeDue(); }}>
            <ListItemIcon><ScheduleIcon fontSize="small" /></ListItemIcon>
            <ListItemText>+7 days</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onSetDue(null); closeDue(); }}>
            <ListItemIcon><ClearIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Clear</ListItemText>
          </MenuItem>
        </Menu>

        {/* LABELS quick menu */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<LabelIcon />}
          onClick={openLabels}
        >
          Labels
        </Button>
        <Menu anchorEl={labelsAnchor} open={Boolean(labelsAnchor)} onClose={closeLabels}>
          {(knownLabels.length ? knownLabels : (todo.labels ?? [])).map(l => {
            const checked = labelsSet.has(l);
            return (
              <MenuItem key={l} onClick={() => { onToggleLabel(l); }}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText>{l}</ListItemText>
              </MenuItem>
            );
          })}
          {!knownLabels.length && !(todo.labels ?? []).length && (
            <MenuItem disabled><ListItemText>No known labels</ListItemText></MenuItem>
          )}
        </Menu>

        {/* label chips (click = toggle) */}
        {(todo.labels ?? []).map((l) => (
          <Chip
            key={l}
            size="small"
            icon={<LabelIcon />}
            label={l}
            variant="outlined"
            onClick={() => onToggleLabel(l)}
            sx={{ cursor: "pointer" }}
          />
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