type Task = {
  id: number;
  semester_id: number;
  title: string;
  description: string;
  due_date: Date | null;
  start: Date;
  end: Date;
  completed: boolean;
  color: string;
}

export type { Task };
