// hooks/useTasks.ts
import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import { Task } from "../types/Task";
import { addTask, getTasks, updateTask, deleteTask } from "../storage/db";
import { Semester } from "../types/Semester";
import { TaskFormValues } from "../components/tasks/TaskForm";

function useTasks(db: SQLite.SQLiteDatabase, selectedSemester: Semester) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from the DB when the hook is mounted or when selectedSemester changes.
  const loadTasks = async () => {
    await getTasks(db, selectedSemester, setTasks);
  };

  // Create a new task using only the fields from the form
  const createTask = async (values: TaskFormValues) => {
    await addTask(
      db,
      selectedSemester,
      values.title,
      values.description ?? "",
      values.dueDate ?? null,
      null, // ⛔️ startTime is intentionally null
      null  // ⛔️ endTime is intentionally null
    );
    await loadTasks();
  };

  // Update an existing task — you'll still need start/end here if editing via calendar
  const updateExistingTask = async (
    id: number,
    values: TaskFormValues & { startTime?: Date | null; endTime?: Date | null },
    completed: boolean
  ) => {
    await updateTask(
      db,
      id,
      values.title,
      values.description ?? "",
      values.dueDate ?? null,
      values.startTime ?? null,
      values.endTime ?? null,
      completed
    );
    await loadTasks();
  };

  const removeTask = async (id: number) => {
    await deleteTask(db, id);
    await loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, [selectedSemester]);

  return { tasks, loadTasks, createTask, updateExistingTask, removeTask };
}

export default useTasks;
