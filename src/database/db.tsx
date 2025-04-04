import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For app settings
import React from 'react';
import Semester from '../types/Semester';
import Task from '../types/Task';

/// Create DB tables if they do not exist
export async function initializeDB(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync(`PRAGMA foreign_keys = ON;`); // Enable foreign key constraints
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        start_time TEXT,
        length_minutes INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE
      );
    `);
    console.log('Database initialized');
  }
  catch (error) {
    console.error('Error initializing the database:', error);
  }
};

// Get all semesters from the database and set them to state
export async function getSemesters(db: SQLite.SQLiteDatabase, semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>) {
  const allRows: any = await db.getAllAsync('SELECT * FROM semesters');
  const semesters: Semester[] = allRows.map((row: any) => ({
    id: row.id,
    title: row.title,
    start_date: new Date(row.start_date),
    end_date: new Date (row.end_date),
  }));
  semestersStateSetter(semesters);
};

export async function getSemester(db: SQLite.SQLiteDatabase, semesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>) {
  const row: any = await db.getFirstAsync('SELECT * FROM semesters WHERE id = $id');
  if(row != null){
    const semester: Semester = {
      id: row.id,
      title: row.title,
      start_date: new Date(row.start_date),
      end_date: new Date (row.end_date),
    };
    semesterStateSetter(semester);
  }
}

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
    console.log('Semester added successfully:');
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
    console.log('Semester deleted successfully');
  }
  catch (error) {
    console.error('Error deleting semester:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
}

// Get all unscheduled tasks from the database
export async function getUnscheduledTasks(db: SQLite.SQLiteDatabase, selectedSemester: Semester, unscheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>) {
  const statement = await db.prepareAsync(
    `SELECT * FROM tasks WHERE start_time IS NULL AND semester_id = $semester_id`
  );
  try {
    const result = await statement.executeAsync({$semester_id: selectedSemester.id,});
    const allRows: any = await result.getAllAsync();
    const unscheduledTasks: Task[] = allRows.map((row: any) => ({
      id: row.id,
      semester_id: row.semester_id,
      title: row.title,
      description: row.description ? row.description : "",
      due_date: row.due_date ? new Date(row.due_date) : null,
      start_time: null,
      length_minutes: row.length_minutes,
      completed: row.completed === 1,
    }));
    unscheduledTasksStateSetter(unscheduledTasks);
  }
  catch (error) {
    console.error('Error getting unscheduled tasks:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
};

// Get all scheduled tasks from the database
export async function getScheduledTasks(db: SQLite.SQLiteDatabase, selectedSemester: Semester, scheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>) {
  const statement = await db.prepareAsync(
    `SELECT * FROM tasks WHERE start_time IS NOT NULL AND semester_id = $semester_id`
  );
  try {
    const result = await statement.executeAsync({$semester_id: selectedSemester.id,});
    const allRows: any = await result.getAllAsync();
    const unscheduledTasks: Task[] = allRows.map((row: any) => ({
      id: row.id,
      semester_id: row.semester_id,
      title: row.title,
      description: row.description ? row.description : "",
      due_date: row.due_date ? new Date(row.due_date) : null,
      start_time: new Date(row.start_time),
      length_minutes: row.length_minutes,
      completed: row.completed === 1,
    }));
    scheduledTasksStateSetter(unscheduledTasks);
  }
  catch (error) {
    console.error('Error getting scheduled tasks:', error);
  }
  finally {
    await statement.finalizeAsync();
  }
};

// Add a new task to the database
export async function addTask(db: SQLite.SQLiteDatabase, selectedSemester: Semester, title: string, description: string, due_date: Date | null, length_minutes: number) {
  const statement = await db.prepareAsync(
    `INSERT INTO tasks (semester_id, title, description, due_date, length_minutes) VALUES ($semester_id, $title, $description, $due_date, $length_minutes)`
  );
  try {
    await statement.executeAsync({
      $semester_id: selectedSemester.id,
      $title: title,
      $description: description ? description : null,
      $due_date: due_date ? due_date.toISOString() : null,
      $length_minutes: length_minutes,
    });
    console.log('Task added successfully:');
  }
  catch (error) {
    console.error('Error adding task:', error);
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
      console.log('Selected semester loaded');
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
    console.log('Selected semester updated');
  }
  catch (error) {
    console.error('Error saving selected semester:', error);
  }
}
