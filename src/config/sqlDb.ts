// src/config/database.js
import pkg from 'pg';
import { Sequelize } from 'sequelize';
const { Pool } = pkg;


// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const pool = new Pool({
  host: process.env.AWS_DB_HOST,
  user: process.env.AWS_DB_USER,
  password: process.env.AWS_DB_PASSWORD,
  database: process.env.AWS_DB_NAME,
  port: Number(process.env.AWS_DB_PORT),
  ssl: true
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

const sequelize = new Sequelize(process.env.AWS_DB_NAME, process.env.AWS_DB_USER, process.env.AWS_DB_PASSWORD, {
  host: process.env.AWS_DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  define: {
    timestamps: false,
    freezeTableName: true 
},
  logging: false,
  port: Number(process.env.AWS_DB_PORT)
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
// export const dropAllTables=  async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');

//     const queryInterface = sequelize.getQueryInterface();

//     // Fetch all table names
//     const tables = await queryInterface.showAllTables();

//     // Drop each table
//     for (const table of tables) {
//       await queryInterface.dropTable(table);
//       console.log(`Dropped table: ${table}`);
//     }

//     console.log('All tables have been dropped successfully.');
//   } catch (error) {
//     console.error('Error dropping tables:', error);
//   } finally {
//     await sequelize.close();
//   }
// }

export default sequelize;
