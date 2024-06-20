// src/config/database.js
import pkg from 'pg';
import { Sequelize } from 'sequelize';
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export const connectSQLDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database!');
  } catch (error) {
    console.error('Connection error:', error.stack);
    process.exit(1);
  }
};

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  define: {
    timestamps: false,
    freezeTableName: true 
},
  logging: false,
  port: Number(process.env.DB_PORT)
});

export const connectSequelizeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the Sequelize PostgreSQL database!');
  } catch (error) {
    console.error('Unable to connect to the Sequelize database:', error);
    process.exit(1);
  }
};


export const getTableDefinition = async () => {
  try {
    const tableDefinition = await sequelize.getQueryInterface().describeTable('orders');
    console.log(tableDefinition);
  } catch (error) {
    console.error('Error describing table:', error);
  }
};

export default sequelize;
