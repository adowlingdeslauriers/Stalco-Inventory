// src/config/database.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});


export const connectSQLDB = async () => {
    try {
        pool.connect()
        .then(() => console.log('Connected to PostgreSQL database!'))
        .catch(err => console.error('Connection error:', err.stack));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };
  

