const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

// get driver connection
const dbo = require("./database/connection");

//Connection to MongoDB

dbo.connectToServer(function (err) {
  if (err) console.error(err);
});


const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(require("./routes/chatbot"));

 
app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);

  });
  console.log(`Server is running on port: ${port}`);
});