export type Priority = "low" | "med" | "high";
export type SubTask = { id: string; title: string; done: boolean };

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  order: number;

  // NEW
  priority?: Priority;     // default "med"
  dueDate?: string;        // ISO yyyy-mm-dd
  labels?: string[];       // e.g. ["frontend","bug"]
  subtasks?: SubTask[];    // checklist
};

// ✅ aggiungi questa riga
export type Task = Todo;