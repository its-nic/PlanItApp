type Task = {
  id: number;
  semester_id: number;
  title: string;
  description: string;
  due_date: Date | null;
  start_time: Date | null;
  length_minutes: number;
  completed: boolean;
  };

export default Task;