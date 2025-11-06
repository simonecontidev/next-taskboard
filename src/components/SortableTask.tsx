"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { memo } from "react";
import { Task } from "@/types";
import { Card, CardContent, Checkbox, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function SortableTaskBase({ task, onToggleComplete, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    outline: isDragging ? "1px dashed var(--mui-palette-divider)" : undefined,
    borderRadius: 12,
  };

  return (
    <Card ref={setNodeRef} style={style} variant="outlined" {...attributes} {...listeners}>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1.25,
        }}
      >
        <Checkbox
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          inputProps={{ "aria-label": `Completa ${task.title}` }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            noWrap
            sx={{ textDecoration: task.completed ? "line-through" : "none" }}
            title={task.title}
          >
            {task.title}
          </Typography>
        </div>
        <Tooltip title="Modifica">
          <IconButton size="small" onClick={() => onEdit(task.id)} aria-label="Modifica">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Elimina">
          <IconButton size="small" onClick={() => onDelete(task.id)} aria-label="Elimina">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

export const SortableTask = memo(SortableTaskBase);