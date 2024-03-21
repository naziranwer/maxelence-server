const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Assuming your Sequelize instance is exported from a file named database.js

const User = sequelize.define('User', {
  // Define attributes (columns) of the User model
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profileImage: {
    type: DataTypes.STRING, // Assuming you store the path to the profile image
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'superadmin', 'user'),
    allowNull: false,
    //defaultValue: 'user', // Default role is 'user'
  },
  resetToken: {
    type: DataTypes.STRING, // Adjust the data type based on your requirements
    allowNull: true, // Allow null as the token may not be set initially
  },
  resetPasswordExpires: {
    type: DataTypes.DATE, // Assuming you store expiration dates as DATE data type
    allowNull: true,
  },
  // Add more attributes as needed...
});

// Sync the model with the database (optional, depending on your setup)
// User.sync();

module.exports = User;
