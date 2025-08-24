import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For app settings
import React from 'react';
import { Semester } from '../types/Semester';
import { Task } from '../types/Task';
import { Assignment } from "../types/Assignment"; // Make sure this import exists

/// Create DB tables if they do not exist
export async function initializeDB(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync(`PRAGMA foreign_keys = ON;`); // Enable foreign key constraints
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
    
      CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL
      );
    
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE
      );
    
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER NOT NULL,
        g_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        start TEXT NULLABLE,
        end TEXT NULLABLE,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
        FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE SET NULL
      );
    `);    
  }
  catch (error) {
    console.error('Error initializing the database:', error);
  }
};

export async function addAssignment(
  db: SQLite.SQLiteDatabase,
  semester_id: number,
  title: string
) {
  const statement = await db.prepareAsync(
    `INSERT INTO assignments (semester_id, title) VALUES ($semester_id, $title)`
  );
  try {
    await statement.executeAsync({ $semester_id: semester_id, $title: title });
  } catch (error) {
    console.error("Error adding assignment:", error);
  } finally {
    await statement.finalizeAsync();
  }
}

export async function getAssignmentsWithTasks(
  db: SQLite.SQLiteDatabase,
  selectedSemester: Semester,
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
) {
  const assignmentsStmt = await db.prepareAsync(
    `SELECT * FROM assignments WHERE semester_id = $semester_id`
  );

  try {
    const assignmentsResult = await assignmentsStmt.executeAsync({ $semester_id: selectedSemester.id });
    const assignmentsRaw: any[] = await assignmentsResult.getAllAsync();

    const tasksStmt = await db.prepareAsync(
      `SELECT * FROM tasks WHERE semester_id = $semester_id`
    );
    const tasksResult = await tasksStmt.executeAsync({ $semester_id: selectedSemester.id });
    const tasksRaw: any[] = await tasksResult.getAllAsync();
    await tasksStmt.finalizeAsync();

    // Helper function to safely create Date objects
    const safeCreateDate = (dateString: string | null): Date | null => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date string: ${dateString}`);
          return null;
        }
        return date;
      } catch (error) {
        console.warn(`Error creating date from string: ${dateString}`, error);
        return null;
      }
    };

    const allTasks: Task[] = tasksRaw.map((row) => ({
      id: row.id,
      semester_id: row.semester_id,
      title: row.title,
      description: row.description || "",
      due_date: safeCreateDate(row.due_date),
      start: safeCreateDate(row.start),
      end: safeCreateDate(row.end),
      completed: row.completed === 1,
      assignment_id: row.assignment_id ?? null,
    }));

    const assignments: Assignment[] = assignmentsRaw.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      semester_id: assignment.semester_id,
      tasks: allTasks.filter(task => task.assignment_id === assignment.id),
    }));

    // Optional: Add uncategorized tasks
    const uncategorizedTasks = allTasks.filter(task => task.assignment_id === null);
    if (uncategorizedTasks.length > 0) {
      assignments.push({
        id: -1,
        title: "Uncategorized",
        semester_id: selectedSemester.id,
        tasks: uncategorizedTasks,
      });
    }

    setAssignments(assignments);
  } catch (error) {
    console.error("Error loading assignments with tasks:", error);
  } finally {
    await assignmentsStmt.finalizeAsync();
  }
}

export async function deleteAssignment(db: SQLite.SQLiteDatabase, id: number) {
  const statement = await db.prepareAsync(
    `DELETE FROM assignments WHERE id = $id`
  );
  try {
    await statement.executeAsync({ $id: id });
  } catch (error) {
    console.error("Error deleting assignment:", error);
  } finally {
    await statement.finalizeAsync();
  }
}



// Get all semesters from the database and set them to state
export async function getSemesters(db: SQLite.SQLiteDatabase, semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>) {
  const allRows: any = await db.getAllAsync('SELECT * FROM semesters');
  
  // Helper function to safely create Date objects
  const safeCreateDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date string: ${dateString}`);
        return null;
      }
      return date;
    } catch (error) {
      console.warn(`Error creating date from string: ${dateString}`, error);
      return null;
    }
  };

  const semesters: Semester[] = allRows.map((row: any) => ({
    id: row.id,
    title: row.title,
    start_date: safeCreateDate(row.start_date) || new Date(),
    end_date: safeCreateDate(row.end_date) || new Date(),
  }));
  semestersStateSetter(semesters);
};

// Add a new semester to the database
export async function addSemester(db: SQLite.SQLiteDatabase, title: string, start_date: Date, end_date: Date) {
  const statement = await db.prepareAsync(
    `INSERT INTO semesters (title, start_date, end_date) VALUES ($title, $start_date, $end_date)`
  );
  try {
    const result = await statement.executeAsync({
      $title: title,
      $start_date: start_date.toISOString(),
      $end_date: end_date.toISOString(),
    });
    await saveSelectedSemester({id:result.lastInsertRowId, title, start_date, end_date});
  }
  catch (error) {
    console.error('Error adding semester:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
};

// Delete a semester from the database
export async function deleteSemester(db: SQLite.SQLiteDatabase, id: number) {
  const statement = await db.prepareAsync(
    `DELETE FROM semesters WHERE id = $id`
  );
  try {
    await statement.executeAsync({ $id: id });
  }
  catch (error) {
    console.error('Error deleting semester:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
}

// Get all tasks from the database
export async function getTasks(db: SQLite.SQLiteDatabase, selectedSemester: Semester, tasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>) {
  const statement = await db.prepareAsync(
    `SELECT * FROM tasks WHERE semester_id = $semester_id`
  );
  try {
    const result = await statement.executeAsync({$semester_id: selectedSemester.id,});
    const allRows: any = await result.getAllAsync();
    const tasks: Task[] = allRows.map((row: any) => {
      // Helper function to safely create Date objects
      const safeCreateDate = (dateString: string | null): Date | null => {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          // Check if the date is valid
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date string: ${dateString}`);
            return null;
          }
          return date;
        } catch (error) {
          console.warn(`Error creating date from string: ${dateString}`, error);
          return null;
        }
      };

      return {
        id: row.id,
        semester_id: row.semester_id,
        title: row.title,
        description: row.description ? row.description : "",
        due_date: safeCreateDate(row.due_date),
        start: safeCreateDate(row.start),
        end: safeCreateDate(row.end),
        completed: row.completed === 1,
      };
    });
    tasksStateSetter(tasks);
  }
  catch (error) {
    console.error('Error getting tasks:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
};

// Get task by ID from the database
export async function getTask(db: SQLite.SQLiteDatabase, id: number, taskStateSetter: React.Dispatch<React.SetStateAction<Task>>) {
  const statement = await db.prepareAsync(
    `SELECT * FROM tasks WHERE id = $id`
  );
  try {
    const result = await statement.executeAsync({$id: id,});
    const row: any = await result.getFirstAsync();
    
    // Helper function to safely create Date objects
    const safeCreateDate = (dateString: string | null): Date | null => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date string: ${dateString}`);
          return null;
        }
        return date;
      } catch (error) {
        console.warn(`Error creating date from string: ${dateString}`, error);
        return null;
      }
    };

    const task: Task = {
      id: row.id,
      semester_id: row.semester_id,
      title: row.title,
      description: row.description ? row.description : "",
      due_date: safeCreateDate(row.due_date),
      start: safeCreateDate(row.start),
      end: safeCreateDate(row.end),
      completed: row.completed === 1,
    };
    taskStateSetter(task);
  }
  catch (error) {
    console.error('Error getting task:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
}

// Add a new task to the database
export async function addTask(
  db: SQLite.SQLiteDatabase,
  selectedSemester: Semester,
  title: string,
  description: string,
  due_date: Date | null,
  start: Date | null,
  end: Date | null
) {
  const statement = await db.prepareAsync(
    `INSERT INTO tasks (semester_id, title, description, due_date, start, end) 
     VALUES ($semester_id, $title, $description, $due_date, $start, $end)`
  );
  try {
    const finalTitle = title?.trim() ? title : await getNextTaskName(db);
    await statement.executeAsync({
      $semester_id: selectedSemester.id,
      $title: finalTitle,
      $description: description ? description : null,
      $due_date: due_date ? due_date.toISOString() : null,
      $start: start ? start.toISOString() : null, // ✅ fixed
      $end: end ? end.toISOString() : null,       // ✅ fixed
    });
  } catch (error) {
    console.error("Error adding task:", error);
  } finally {
    await statement.finalizeAsync();
  }
}



export async function getNextTaskName(
  db: SQLite.SQLiteDatabase,
  baseName = "New Task"
): Promise<string> {
  const statement = await db.prepareAsync(
    `SELECT title FROM tasks WHERE title LIKE ?`
  );

  try {
    const result = await statement.executeAsync([`${baseName}%`]);
    const rows: any[] = await result.getAllAsync();

    const existingTitles = rows.map((row) => row.title);
    let i = 1;
    let newTitle = baseName;
    while (existingTitles.includes(newTitle)) {
      newTitle = `${baseName} ${i++}`;
    }

    return newTitle;
  } catch (error) {
    console.error("Error generating task name:", error);
    return baseName;
  } finally {
    await statement.finalizeAsync();
  }
}

// storage/db.ts

export async function createTask(
  db: SQLite.SQLiteDatabase,
  selectedSemester: Semester,
  assignmentId: number | null, // Link to the assignment (can be null if not assigned)
  title: string,
  description: string,
  due_date: Date | null,
  start: Date | null,
  end: Date | null
) {
  const statement = await db.prepareAsync(
    `INSERT INTO tasks (semester_id, assignment_id, title, description, due_date, start, end) 
     VALUES ($semester_id, $assignment_id, $title, $description, $due_date, $start, $end)`
  );
  
  try {
    await statement.executeAsync({
      $semester_id: selectedSemester.id,
      $assignment_id: assignmentId,  // This links the task to an assignment (optional)
      $title: title,
      $description: description || null,  // Optional: handle if description is empty
      $due_date: due_date ? due_date.toISOString() : null,
      $start: start ? start.toISOString() : null,
      $end: end ? end.toISOString() : null,
    });
  } catch (error) {
    console.error("Error creating task:", error);
  } finally {
    await statement.finalizeAsync();
  }
}


// Update task in the database
export async function updateTask(
  db: SQLite.SQLiteDatabase,
  id: number,
  title: string,
  description: string,
  due_date: Date | null,
  start: Date | null,
  end: Date | null,
  completed: boolean
) {
  const statement = await db.prepareAsync(
    `UPDATE tasks SET title = $title, description = $description, due_date = $due_date, start = $start, end = $end, completed = $completed WHERE id = $id`
  );
  try {
    await statement.executeAsync({
      $id: id,
      $title: title,
      $description: description || null,
      $due_date: due_date ? due_date.toISOString() : null,
      $start: start ? start.toISOString() : null,
      $end: end ? end.toISOString() : null,
      $completed: completed ? 1 : 0,
    });
  } catch (error) {
    console.error("Error updating task:", error);
  } finally {
    await statement.finalizeAsync();
  }
}


// Update the task time in the database
export async function updateTaskTime(db: SQLite.SQLiteDatabase, id: number, start: Date, end: Date) {
  const statement = await db.prepareAsync(
    `UPDATE tasks SET start = $start, end = $end WHERE id = $id`
  );
  try {
    await statement.executeAsync({
      $id: id,
      $start: start.toISOString(),
      $end: end.toISOString(),
    });
  }
  catch (error) {
    console.error('Error updating task time:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
}

// Delete a task from the database
export async function deleteTask(db: SQLite.SQLiteDatabase, id: number) {
  const statement = await db.prepareAsync(
    `DELETE FROM tasks WHERE id = $id`
  );
  try {
    await statement.executeAsync({ $id: id });
  }
  catch (error) {
    console.error('Error deleting task:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
}

// Get the selected semester from the async storage
export async function getSelectedSemester(selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>) {
  try {
    const jsonValue = await AsyncStorage.getItem('selected-semester');
    if(jsonValue != null) {
      const parsedValue = JSON.parse(jsonValue);
      const selectedSemester: Semester = {
        id: parsedValue.id,
        title: parsedValue.title,
        start_date: new Date(parsedValue.start_date),
        end_date: new Date(parsedValue.end_date),
      };
      selectedSemesterStateSetter(selectedSemester);
    }
  }
  catch (error) {
    console.error('Error reading selected semester:', error);
  }
}

// Set the selected semester from the async storage
export async function saveSelectedSemester(semester: Semester) {
  try {
    const jsonValue = JSON.stringify({
      id: semester.id,
      title: semester.title,
      start_date: semester.start_date.toISOString(),
      end_date: semester.end_date.toISOString(),
    });
    await AsyncStorage.setItem('selected-semester', jsonValue);
  }
  catch (error) {
    console.error('Error saving selected semester:', error);
  }
}
