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
    "mongodb+srv://Manasvi29:bharat2909@cluster0.r7a9dpa.mongodb.net/group13Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log(err));

// Initial route
app.use("/", route);

// port
app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});