import {pool} from "../config/sqlDb.js"

const createTables = async () => {
    try {
      await pool.query(`
      CREATE TABLE IF NOT EXISTS Orders (
        clientId VARCHAR(255),
        date TIMESTAMP,
        totalOrders INT,
        Canada INT,
        US INT,
        INTL INT,
        avgQtyPerOrder FLOAT,
        PRIMARY KEY (clientId, date),
        FOREIGN KEY (clientId) REFERENCES Customers(clientId)
      );
      
      CREATE TABLE IF NOT EXISTS Customers (
        clientId VARCHAR(255) PRIMARY KEY,
        clientName VARCHAR(255)
      );
      
      CREATE TABLE IF NOT EXISTS RegionShipped (
        clientId VARCHAR(255),
        date TIMESTAMP,
        country VARCHAR(255),
        stateProvince VARCHAR(255),
        PRIMARY KEY (clientId, date),
        FOREIGN KEY (clientId) REFERENCES Customers(clientId)
      );
      
      CREATE TABLE IF NOT EXISTS SkuSales (
        clientId VARCHAR(255),
        retailerId INT,
        sku VARCHAR(255),
        date TIMESTAMP,
        totalOrders INT,
        totalUnits INT,
        PRIMARY KEY (clientId, sku, date),
        FOREIGN KEY (clientId) REFERENCES Customers(clientId)
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