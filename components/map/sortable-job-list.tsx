"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { Job } from "@/types";
import { formatTimeWindow } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export function SortableJobList({
  jobs,
  color,
  onReorder,
}: {
  jobs: Job[];
  color: string;
  onReorder: (orderedIds: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = jobs.findIndex((j) => j.id === active.id);
    const newIndex = jobs.findIndex((j) => j.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(jobs, oldIndex, newIndex);
    onReorder(next.map((j) => j.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {jobs.map((job, index) => (
            <SortableRow key={job.id} job={job} index={index} color={color} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ job, index, color }: { job: Job; index: number; color: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-card p-3",
        isDragging && "relative z-10 shadow-lg ring-1 ring-primary/40",
      )}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={`Reorder ${job.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#0a0a0a]"
        style={{ backgroundColor: color }}
      >
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-medium text-foreground">{job.title}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTimeWindow(job.time_window_start, job.time_window_end)}
          </span>
        </div>
        {job.customer_name && (
          <p className="truncate text-sm text-muted-foreground">{job.customer_name}</p>
        )}
        <p className="truncate text-xs text-muted-foreground">{job.address}</p>
      </div>
    </li>
  );
}
