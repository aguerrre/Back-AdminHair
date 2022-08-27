const express = require('express');
const { dbConn } = require('./database/config');
require("dotenv").config();

// Create express server
const app = express();

// Read and parse body (bodyparams)
app.use(express.json());

// MongoDb connection
dbConn();

// RUTAS

app.listen(process.env.PORT, () => {
  console.log("servidor en puerto " + process.env.PORT);
});