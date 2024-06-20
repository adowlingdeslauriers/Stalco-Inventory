// models/skuSales.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sqlDb.js';
import Customers from './customersModel.js';

class SkuSales extends Model {}

SkuSales.init({
  client_id: {
    type: DataTypes.STRING,
    references: {
      model: Customers,
      key: 'client_id'
    }
  },
  retailer_id: {
    type: DataTypes.INTEGER
  },
  sku: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATE,
    primaryKey: true
  },
  total_orders: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_units: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { 
  sequelize, 
  modelName: 'skusales',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['retailer_id'] },
    { fields: ['sku'] },
    { fields: ['date'] }
  ]
});

SkuSales.belongsTo(Customers, { foreignKey: 'client_id' });

export default SkuSales;
