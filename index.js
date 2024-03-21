// app.js
const express = require('express');
const app = express();
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 3000;


testConnection().then(() => {
    // Database connection successful, start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(error => {
    // Database connection failed, log the error
    console.error('Failed to connect to the database:', error);
  });

app.use("/auth",authRoutes);

app.get("/",(req,res)=>{
    res.send("hiiii you have entered my app");
})

