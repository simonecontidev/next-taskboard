import type { Todo } from "@/types";

const STORAGE_KEY = "next-taskboard/todos";
const STORAGE_VERSION = 3;

type StoredV2 = { version: 2; todos: any[] };
type StoredV3 = { version: 3; todos: any[] };
type AnyStored = StoredV2 | StoredV3 | any[];

export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: AnyStored = JSON.parse(raw);

    // Vecchio formato: array semplice
    if (Array.isArray(parsed)) {
      const withOrder = parsed.map((t: any, i: number) => ({ order: i, ...t }));
      return normalizeToV3(withOrder);
    }

    if (parsed.version === 2) {
      return normalizeToV3(parsed.todos);
    }

    if (parsed.version === 3) {
      return normalizeToV3(parsed.todos);
    }

    return [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]) {
  const payload: StoredV3 = { version: STORAGE_VERSION, todos };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function normalizeToV3(list: any[]): Todo[] {
  const ordered = (list || [])
    .map((t, i) => ({ order: Number.isFinite(t.order) ? t.order : i, ...t }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t, i) => ({
      ...t,
      order: i,
      // defaults v3
      priority: (t.priority ?? "med") as Todo["priority"],
      labels: Array.isArray(t.labels) ? t.labels : [],
      subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
    }));
  return ordered;
}