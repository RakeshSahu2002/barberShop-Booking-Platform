// config/db.js

require("dotenv").config();

console.log("=================================");
console.log("Database initialization started");
console.log("Render production mode");
console.log("=================================");


// =====================================================
// TEMP DATABASE ADAPTER
// SQLite (better-sqlite3) removed for Render deployment
// Final step: PostgreSQL migration (Supabase)
// =====================================================


const db = {

  // Replacement for db.exec()
  exec: (query) => {

    console.log("DB EXEC skipped");

    return true;

  },


  // Replacement for db.prepare()
  prepare: (query) => {

    return {

      // SELECT single row
      get: (...params) => {

        console.log(
          "DB GET skipped:",
          query
        );

        return null;

      },


      // SELECT multiple rows
      all: (...params) => {

        console.log(
          "DB ALL skipped:",
          query
        );

        return [];

      },


      // INSERT / UPDATE / DELETE
      run: (...params) => {

        console.log(
          "DB RUN skipped:",
          query
        );


        return {

          lastInsertRowid: 1,

          changes: 1

        };

      }

    };

  }

};


// =====================================================
// Database Loaded
// =====================================================

console.log("✅ Database adapter loaded");


module.exports = db;