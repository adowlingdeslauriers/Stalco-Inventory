// models/orders.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sqlDb.js';
import Customers from './customersModel.js';

class Orders extends Model {}

Orders.init({
  client_id: {
    type: DataTypes.STRING,
    references: {
      model: Customers,
      key: 'client_id'
    }
  },
  date: {
    type: DataTypes.DATE,
    primaryKey: true
  },
  total_orders: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  canada: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  us: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  intl: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  internal: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  usps: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dhl: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fedex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ups: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  canada_post: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  other_carriers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avg_qty_per_order: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, { 
  sequelize, 
  modelName: 'orders',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['date'] }
  ]
});

Orders.belongsTo(Customers, { foreignKey: 'client_id' });


export default Orders;
