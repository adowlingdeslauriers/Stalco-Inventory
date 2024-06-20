// models/regionShipped.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sqlDb.js';
import Customers from './customersModel.js';

class RegionShipped extends Model {}

RegionShipped.init({
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
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state_province: {
    type: DataTypes.STRING
  },
  total_orders: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { 
  sequelize, 
  modelName: 'regionshipped',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['date'] },
    { fields: ['country'] },
    { fields: ['state_province'] }
  ]
});

RegionShipped.belongsTo(Customers, { foreignKey: 'client_id' });
export default RegionShipped;
