import { useState, useEffect } from "react";
import { Assignment } from "../types/Assignment";
import { Task } from "../types/Task";
import { Semester } from "../types/Semester";

// Define a simple TaskFormValues type for new and updated tasks.
export interface TaskFormValues {
  title: string;
  description?: string;
  dueDate?: Date | null;
}

function useAssignments(db: any, selectedSemester: Semester) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Initialize with mock data: one assignment with two tasks.
  useEffect(() => {
    setAssignments([
      {
        id: 1,
        title: "Assignment 1",
        semester_id: selectedSemester.id,
        tasks: [
          {
            id: 1,
            semester_id: selectedSemester.id,
            title: "Task 1",
            description: "First task description",
            due_date: new Date("2025-05-01"),
            start: null,
            end: null,
            completed: false,
            assignment_id: 1,
          },
          {
            id: 2,
            semester_id: selectedSemester.id,
            title: "Task 2",
            description: "Second task description",
            due_date: new Date("2025-06-01"),
            start: null,
            end: null,
            completed: false,
            assignment_id: 1,
          },
        ],
      },
    ]);
  }, [selectedSemester]);

  // Create a new assignment (appends to our mock data)
  const createAssignment = async (title: string) => {
    const newAssignment: Assignment = {
      id: assignments.length + 1,
      title,
      semester_id: selectedSemester.id,
      tasks: [],
    };
    setAssignments((prev) => [...prev, newAssignment]);
  };

  // Remove an assignment with the given id.
  const removeAssignment = async (id: number) => {
    setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
  };

  // Create a new task for a given assignment.
  const createTaskForAssignment = async (
    assignmentId: number,
    values: TaskFormValues
  ) => {
    // Generate a new unique task id based on all existing task ids.
    const newId =
      Math.max(0, ...assignments.flatMap((a) => a.tasks.map((t) => t.id))) + 1;
    const newTask: Task = {
      id: newId,
      semester_id: selectedSemester.id,
      title: values.title,
      description: values.description || "",
      due_date: values.dueDate || null,
      start: null,
      end: null,
      completed: false,
      assignment_id: assignmentId,
    };
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, tasks: [...assignment.tasks, newTask] }
          : assignment
      )
    );
  };

  // Update an existing task's title, description, due date, and completion status.
  const updateExistingTask = async (
    id: number,
    values: TaskFormValues,
    completed: boolean
  ) => {
    setAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        tasks: assignment.tasks.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              title: values.title,
              description: values.description || "",
              due_date: values.dueDate || null,
              completed,
            };
          }
          return task;
        }),
      }))
    );
  };

  // Remove a task with the given id.
  const removeTask = async (id: number) => {
    setAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        tasks: assignment.tasks.filter((task) => task.id !== id),
      }))
    );
  };

  return {
    assignments,
    createAssignment,
    createTaskForAssignment,
    updateExistingTask,
    removeTask,
    removeAssignment, // Expose removeAssignment
  };
}

export default useAssignments;
