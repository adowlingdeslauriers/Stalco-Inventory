// models/customers.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sqlDb.js';

class Customers extends Model {}

Customers.init({
  client_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  clientname: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { 
  sequelize, 
  modelName: 'customers' 
});


export default Customers;
