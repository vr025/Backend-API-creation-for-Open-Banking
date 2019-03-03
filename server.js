const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const users = require("./routes/api/users");
const account = require("./routes/api/Account");

const passport = require("passport");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://vignesh:zK8lNZR8mhKykpqp@cluster0-byx3s.mongodb.net/fifththird?retryWrites=true"
  )
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connection Failed");
  });

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Use Routes
app.use("/api/users", users);
app.use("/api/account", account);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
