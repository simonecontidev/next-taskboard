const KEY = "next-taskboard/tasks";
const VERSION = 2;

type Stored = { version: number; tasks: any[] };

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data: Stored = JSON.parse(raw);

    // migrazione da versioni precedenti
    const migrated = migrate(data);
    return migrated.tasks as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  const payload: Stored = { version: VERSION, tasks };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

function migrate(data: any): Stored {
  if (!data || !Array.isArray(data.tasks)) {
    return { version: VERSION, tasks: [] };
  }
  // v1 -> v2: aggiunge order se mancante, normalizza
  if (!data.version || data.version < 2) {
    const ordered = (data.tasks as any[]).map((t, i) => ({
      order: typeof t.order === "number" ? t.order : i,
      ...t,
    }));
    // ricalcola order 0..n coerente
    const normalized = ordered
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((t, i) => ({ ...t, order: i }));
    return { version: VERSION, tasks: normalized };
  }
  // già v2
  const normalized = (data.tasks as any[])
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t, i) => ({ ...t, order: i }));
  return { version: data.version, tasks: normalized };
}

// Tipi locali
export type Task = import("../types").Task;