import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For app settings
import React from 'react';
import Semester from '../types/Semester';

/// Create DB tables if they do not exist
export async function initializeDB(db: SQLite.SQLiteDatabase) {
  try {
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
        end_time TEXT,
        completed INTEGER DEFAULT 0
      );
    `);
  }
  catch (error) {
    console.error('Error initializing the database:', error);
  }
};

// Get all semesters from the database and set them to state
export async function getSemesters(db: SQLite.SQLiteDatabase, semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>) {
  const allRows: Semester[] = await db.getAllAsync('SELECT * FROM semesters');
  const semesters: Semester[] = allRows.map((row) => ({
    id: row.id,
    title: row.title,
    start_date: new Date(row.start_date),
    end_date: new Date (row.end_date),
  }));
  semestersStateSetter(semesters);
};

export async function getSemester(db:SQLite.SQLiteDatabase, semesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>) {
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
export async function addSemester(db: SQLite.SQLiteDatabase,  title: string, start_date: Date, end_date: Date) {
  const statement = await db.prepareAsync(
    `INSERT INTO semesters (title, start_date, end_date) VALUES ($title, $start_date, $end_date)`
  );
  try {
    let result = await statement.executeAsync({
      $title: title,
      $start_date: start_date.toISOString(),
      $end_date: end_date.toISOString(),
    });
    console.log('Semester added successfully:', result);
    await saveSelectedSemester({id:result.lastInsertRowId, title, start_date, end_date});
  }
  catch (error) {
    console.error('Error adding semester:', error);
    return 0;
  }
  finally {
    await statement.finalizeAsync();
  }
};

// Delete a semester from the database
export async function deleteSemester(db: SQLite.SQLiteDatabase, id:number) {
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

// Get the selected semester from the async storage
export async function getSelectedSemester(selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>) {
  try {
    const jsonValue = await AsyncStorage.getItem('selected-semester');
    if(jsonValue != null) {
      selectedSemesterStateSetter(JSON.parse(jsonValue));
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
    const jsonValue = JSON.stringify(semester);
    await AsyncStorage.setItem('selected-semester', jsonValue);
    console.log('Selected semester updated');
  }
  catch (error) {
    console.error('Error saving selected semester:', error);
  }
}
