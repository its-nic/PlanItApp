type Task = {
  id: number;
  semester_id: number;
  title: string;
  description: string;
  due_date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  completed: boolean;
  };

export default Task;