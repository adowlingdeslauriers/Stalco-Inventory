// syncModels.ts
import sequelize from '../../config/sqlDb.js';
import Customers from './customersModel.js';
import Orders from './ordersModel.js';
import RegionShipped from './regionShippedModel.js';
import SkuSales from './skuSalesModel.js';

export const syncModels = async () => {
  try {
    await sequelize.sync({ force: true }); // Use 'force: true' only for development; it drops and recreates the tables
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};


