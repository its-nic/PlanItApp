import * as SQLite from 'expo-sqlite';

var db;

const initializeDB = async () => {
  try {
    db = await SQLite.openDatabaseAsync('planItDB');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
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
      CREATE TABLE IF NOT EXISTS settings (
        selected_semester_id INTEGER
      );
    `);
  } catch (error) {  
    console.error('Error initializing the database:', error);
  }
}

// Insert a new task into the tasks table
const addTask = async (task) => {
  try {
    const { semester_id, title, description, due_date, start_time, end_time } = task;
    await db.execAsync(`
      INSERT INTO tasks (semester_id, title, description, due_date, start_time, end_time)
      VALUES ('${semester_id}', '${title}', '${description}', '${due_date}', '${start_time}', '${end_time}')
    `);
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

export { initializeDB };
