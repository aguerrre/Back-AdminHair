const express = require("express");
const { dbConn } = require("./database/config");
require("dotenv").config();
const cors = require('cors');

// Create express server
const app = express();

//Config CORS
app.use(cors());

// Read and parse body (bodyparams)
app.use(express.json());

// MongoDb connection
dbConn();

// RUTAS
app.use("/api/auth", require("./routes/auth.routes"));

app.listen(process.env.PORT, () => {
  console.log("Listening on port: " + process.env.PORT);
});
