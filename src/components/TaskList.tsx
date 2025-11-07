"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Task } from "@/types";
import { SortableTask } from "./SortableTask";
import { useEffect, useMemo } from "react";
import { saveTodos as saveTasks } from "@/lib/persist";
type Props = {
  tasks: Task[];
  setTasks: (next: Task[]) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TaskList({
  tasks,
  setTasks,
  onToggleComplete,
  onEdit,
  onDelete,
}: Props) {
  // Ordina in base a order per render consistente
  const ordered = useMemo(
    () => [...tasks].sort((a, b) => a.order - b.order),
    [tasks]
  );

  // Salva sempre l’ordine corrente (debounce non strettamente necessario qui)
  useEffect(() => {
    saveTasks(ordered);
  }, [ordered]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((t) => t.id === active.id);
    const newIndex = ordered.findIndex((t) => t.id === over.id);

    const moved = arrayMove(ordered, oldIndex, newIndex).map((t, i) => ({
      ...t,
      order: i,
    }));
    setTasks(moved); // trigger save via useEffect
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ordered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: "grid", gap: 10 }}>
          {ordered.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}