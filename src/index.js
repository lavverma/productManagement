require("dotenv").config()
const express = require("express");
var bodyParser = require("body-parser");
const mongoose  = require("mongoose");

const route = require("./routes/route.js");
const app = express();
const multer =require('multer')

app.use(bodyParser.json()); // tells the system that you want json to be used
// app.use(bodyParser.urlencoded({ extended: true })); 
app.use(multer().any())

// mongoDb connection
mongoose
  .connect(
    process.env.DATA_BASE,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log(err));

// Initial route
app.use("/", route);

// port
app.listen(process.env.PORT, function () {
  console.log("Express app running on port " + (process.env.PORT ));
});