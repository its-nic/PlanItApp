// types/Task.ts
export interface Task {
  id: number;
  semester_id: number;
  title: string;
  description?: string;
  due_date?: Date | null;
  start?: Date | null;
  end?: Date | null;
  completed: boolean;
  assignment_id?: number | null;
}
