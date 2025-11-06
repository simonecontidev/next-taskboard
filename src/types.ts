export type Priority = "low" | "med" | "high";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;

  order: number;              
  priority?: Priority;
  dueDate?: string;           
  labels?: string[];
  notes?: string;
};