type Task = {
  id: number;
  semester_id: number;
  title: string;
  description: string;
  due_date: Date | null;       // e.g., 2025-04-06
  due_time: string | null;     // e.g., '14:30' in 24h format
  start_time: Date | null;     // Optional, set by drag/drop
  end_time: Date | null;       // Optional, set by drag/drop
  completed: boolean;
}

export type { Task };
