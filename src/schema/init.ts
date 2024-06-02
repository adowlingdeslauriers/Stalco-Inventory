import {pool} from "../config/sqlDb.js"

const createTables = async () => {
    try {
      await pool.query(`
      CREATE TABLE IF NOT EXISTS Customers (
        clientId VARCHAR(255) PRIMARY KEY,
        clientName VARCHAR(255) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS Orders (
        clientId VARCHAR(255),
        date TIMESTAMP,
        totalOrders INT NOT NULL,
        Canada INT DEFAULT 0,
        US INT DEFAULT 0,
        INTL INT DEFAULT 0,
        avgQtyPerOrder FLOAT NOT NULL,
        PRIMARY KEY (clientId, date),
        FOREIGN KEY (clientId) REFERENCES Customers(clientId) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS RegionShipped (
        clientId VARCHAR(255),
        date TIMESTAMP,
        country VARCHAR(255) NOT NULL,
        stateProvince VARCHAR(255),
        PRIMARY KEY (clientId, date),
        FOREIGN KEY (clientId) REFERENCES Customers(clientId) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS SkuSales (
        clientId VARCHAR(255),
        retailerId INT,
        sku VARCHAR(255),
        date TIMESTAMP,
        totalOrders INT NOT NULL,
        totalUnits INT NOT NULL,
        PRIMARY KEY (clientId, sku, date),
        FOREIGN KEY (clientId) REFERENCES Customers(clientId) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_orders_clientId ON Orders(clientId);
      CREATE INDEX idx_regionShipped_clientId ON RegionShipped(clientId);
      CREATE INDEX idx_skuSales_clientId ON SkuSales(clientId);
      
      `);
  
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      await pool.end();
    }
  };
  
  createTables();