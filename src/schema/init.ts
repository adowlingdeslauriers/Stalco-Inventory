import {pool} from "../config/sqlDb.js"

export const createTables = async () => {
  try {
    await pool.query(`

    CREATE TABLE IF NOT EXISTS Customers (
      client_id VARCHAR(255) PRIMARY KEY,
      clientName VARCHAR(255) NOT NULL
    );
      CREATE TABLE IF NOT EXISTS Orders (
        client_id VARCHAR(255),
        date DATE,
        total_orders INT NOT NULL,
        canada INT DEFAULT 0,
        us INT DEFAULT 0,
        intl INT DEFAULT 0,
        internal INT DEFAULT 0,
        usps INT DEFAULT 0,
        dhl INT DEFAULT 0,
        fedex INT DEFAULT 0,
        ups INT DEFAULT 0,
        canada_post INT DEFAULT 0,
        other_carriers INT DEFAULT 0,
        avg_qty_per_order DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (client_id, date)
      );
      
      CREATE TABLE IF NOT EXISTS RegionShipped (
        client_id VARCHAR(255),
        date DATE,
        country VARCHAR(255) NOT NULL,
        state_province VARCHAR(255),
        total_orders INT NOT NULL,
        PRIMARY KEY (client_id, date, country, state_province)
      );
      
      CREATE TABLE IF NOT EXISTS SkuSales (
        client_id VARCHAR(255),
        retailer_id INT,
        sku VARCHAR(255),
        date DATE,
        total_orders INT NOT NULL,
        total_units DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (client_id, sku, date)
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_client_id ON Orders(client_id);
      CREATE INDEX IF NOT EXISTS idx_orders_date ON Orders(date);
      
      CREATE INDEX IF NOT EXISTS idx_regionShipped_client_id ON RegionShipped(client_id);
      CREATE INDEX IF NOT EXISTS idx_regionShipped_date ON RegionShipped(date);
      CREATE INDEX IF NOT EXISTS idx_regionShipped_country ON RegionShipped(country);
      CREATE INDEX IF NOT EXISTS idx_regionShipped_state_province ON RegionShipped(state_province);
      
      CREATE INDEX IF NOT EXISTS idx_skuSales_client_id ON SkuSales(client_id);
      CREATE INDEX IF NOT EXISTS idx_skuSales_retailer_id ON SkuSales(retailer_id);
      CREATE INDEX IF NOT EXISTS idx_skuSales_sku ON SkuSales(sku);
      CREATE INDEX IF NOT EXISTS idx_skuSales_date ON SkuSales(date);
    `);
  } catch (error) {
    console.error("Error creating tables: ", error);
    throw error;
  }
};



export const insertSample = async () => {
    try {
      await pool.query(`
      INSERT INTO Customers (client_id, clientName)
VALUES
  (1384, '1000057862 Ontario Inc'),
  (1395, '1000476461 Ontario Inc'),
  (1402, '1000777135 Ontario Inc'),
  (1399, '15234085 canada Inc'),
  (1405, 'Ausica UAB (306238207)'),
  (138, 'Bee2gethervibe'),
  (76, 'Biovation Labs, LLC'),
  (1315, 'Boom By Cindy Joseph Ltd'),
  (1270, 'Charmed Aroma Inc'),
  (1350, 'Cotidian Inc'),
  (84, 'Cuddle & Kind'),
  (180, 'Cuddle+Kind Ordoro Test Account'),
  (1319, 'Dosanjh Brands Inc DBA Untouch'),
  (1297, 'Eagle Labs Inc'),
  (1404, 'Eagle Labs, Incorporated'),
  (163, 'Fiera Cosmetics Inc'),
  (1337, 'Frank Body Cosmetics Ltd'),
  (1398, 'Furme (Argos Enterprises LLC)'),
  (1403, 'Great HealthWorks Inc'),
  (1394, 'Green Digital Inc'),
  (1305, 'Iedesa S.R.O.'),
  (1389, 'Inova Cosmetics (Ugur Middle East DWC L)'),
  (1342, 'Kicking Horse Coffee Co. Ltd'),
  (1244, 'LUS Brands Inc'),
  (1387, 'Lynnbrook LLC'),
  (1241, 'New Vitality canada Limited'),
  (1393, 'Nimble Beauty Inc'),
  (1369, 'NuGale Pharmaceutical'),
  (129, 'NutraNorth Inc.'),
  (1365, 'Oh Snap Inc'),
  (1347, 'Orbio World, UAB'),
  (1376, 'Petlab Group Limited'),
  (1391, 'PH Labs Inc'),
  (1343, 'PlantVital'),
  (130, 'Private Label Skin'),
  (144, 'Project Give back'),
  (1386, 'PYM LLC'),
  (1375, 'Read Investments LLC'),
  (1400, 'Simplpens LLC'),
  (1302, 'Soylent Nutrition Inc'),
  (132, 'Stalco - White Label '),
  (1, 'Stalco CP Account'),
  (1234, 'Stalco House Brand'),
  (1214, 'Stokes Ewing Limited'),
  (14, 'Systems B International LLC'),
  (1378, 'Test Account - Backup'),
  (1207, 'Test Account - Main'),
  (71, 'Testing Account'),
  (1219, 'The Nutra Company Inc'),
  (1313, 'Tristar Products Inc'),
  (39, 'Xyngular canada ULC');

      `);
  
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      await pool.end();
    }
  };
  
  