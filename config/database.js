const { Sequelize } = require('sequelize');
require("dotenv").config();

// Load environment variables
const { DB_NAME, DB_USER, DB_PASSWORD,DB_HOST } = process.env;

// Define database connection parameters
const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  dialect: 'mysql',
  logging: false, // Disable logging SQL queries to console
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Export the Sequelize instance and testConnection function
module.exports = {
  sequelize,
  testConnection,
};
