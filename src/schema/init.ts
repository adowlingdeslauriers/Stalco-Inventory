import {pool} from "../config/sqlDb.js"

const createTables = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS Orders (
          ClientID VARCHAR(255),
          date TIMESTAMP,
          totalOrders INT,
          Canada INT,
          US INT,
          INTL INT,
          avgQtyPerOrder FLOAT
        );
  
        CREATE TABLE IF NOT EXISTS Customers (
          ClientID VARCHAR(255) PRIMARY KEY,
          ClientName VARCHAR(255)
        );
  
        CREATE TABLE IF NOT EXISTS RegionShipped (
          ClientID VARCHAR(255),
          date TIMESTAMP,
          country VARCHAR(255),
          stateProvince VARCHAR(255)
        );
  
        CREATE TABLE IF NOT EXISTS SkuSales (
          ClientID VARCHAR(255),
          retailerId INT,
          sku VARCHAR(255),
          date TIMESTAMP,
          totalOrders INT,
          totalUnits INT
        );
      `);
  
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      await pool.end();
    }
  };
  
  createTables();