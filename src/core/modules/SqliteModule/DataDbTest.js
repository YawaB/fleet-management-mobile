// Database.js
import SQLite from "react-native-sqlite-storage";

// Enable debugging mode for SQLite plugin. This is useful for tracing errors.
// DO NOT ENABLE IN PRODUCTION APPLICATIONS.

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "TestDatabase.db"; // Database name
const database_version = "1.0"; // Version
const database_displayname = "SQLite Test Database"; // Display name
const database_size = 200000; // Size

export const getDBConnection = async () => {
  return await SQLite.openDatabase(
    database_name,
    database_version,
    database_displayname,
    database_size
  );
};

/**
 * This function creates a table named 'Users' in the database 'db'. If the table
 * already exists, it does nothing. The table has three columns: 'id' (an
 * auto-incrementing primary key), 'name' (a text column), and 'age' (an integer
 * column).
 *
 * @param {Object} db - The database connection object.
 * @return {Promise} A promise that resolves when the table is created, or
 * rejects with an error if there was an issue creating the table.
 */
export const createTable = async (db) => {
  try {
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                age INTEGER
            );`
    );
  } catch (error) {
    console.error("Error creating table: ", error);
  }
};

//Next, add a function to insert data into the table:

export const insertUser = async (db, name, age) => {
  try {
    await db.executeSql(`INSERT INTO Users (name, age) VALUES (?, ?)`, [
      name,
      age,
    ]);
  } catch (error) {
    console.error("Error inserting data: ", error);
  }
};

export const getUsers = async (db) => {
  try {
    const results = await db.executeSql(`SELECT * FROM Users`);
    return results[0].rows.raw(); // Get raw data
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};
