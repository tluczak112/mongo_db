var express = require('express')
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var app = express()

var router = express.Router();

require("./routes/routes")(router);

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

app.use(router);

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://<dbuser>:<dbpassword>@ds235431.mlab.com:35431/heroku_tnf54gpp";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var db = mongoose.connection;

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.listen(process.env.PORT || 5000, function() {
  console.log("App running on port 5000!");
});