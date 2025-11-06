"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Box, Checkbox, IconButton, TextField, Typography, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  id: string;
  title: string;
  completed: boolean;
  isEditing: boolean;
  setRef: (node: HTMLDivElement | null) => void;

  onToggleCompleted: () => void;
  onStartEdit: () => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  editValue: string;
  setEditValue: (v: string) => void;
};

function SortableTodoItemBase({
  id, title, completed, isEditing, setRef,
  onToggleCompleted, onStartEdit, onConfirmEdit, onCancelEdit, onDelete,
  editValue, setEditValue,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    outline: isDragging ? "1px dashed var(--mui-palette-divider)" : undefined,
    borderRadius: 12,
  };

  return (
    <Paper
      elevation={1}
      className="jt-card"
      ref={(node) => { setNodeRef(node); setRef(node); }}
      style={style}
      sx={{
        p: 1.25,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-2px)" },
        cursor: "grab",
      }}
      {...attributes}
      {...listeners}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
        <Checkbox
          checked={completed}
          onChange={onToggleCompleted}
          inputProps={{ "aria-label": `Mark ${title} as completed` }}
        />

        {isEditing ? (
          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); onConfirmEdit(); }}
            sx={{ flex: 1, display: "flex", gap: 1 }}
          >
            <TextField
              autoFocus
              size="small"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") onCancelEdit(); }}
              fullWidth
            />
            <IconButton aria-label="Confirm" onClick={onConfirmEdit}><CheckIcon /></IconButton>
            <IconButton aria-label="Cancel" onClick={onCancelEdit}><CloseIcon /></IconButton>
          </Box>
        ) : (
          <Typography
            onDoubleClick={onStartEdit}
            sx={{
              flex: 1,
              userSelect: "none",
              textDecoration: completed ? "line-through" : "none",
              color: completed ? "text.secondary" : "text.primary",
            }}
            title={title}
          >
            {title}
          </Typography>
        )}
      </Box>

      {!isEditing && (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton aria-label={`Edit ${title}`} onClick={onStartEdit}><EditIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton aria-label={`Delete ${title}`} onClick={onDelete}><DeleteIcon /></IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
}

export const SortableTodoItem = memo(SortableTodoItemBase);