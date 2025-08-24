// types/Assignment.ts
import { Task } from "./Task";

export interface Assignment {
  id: number;
  title: string;
  semester_id: number;
  tasks: Task[];
}
