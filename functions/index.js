const functions = require("firebase-functions");

const app = require("express")();




const { getAllScreams, postOneScreams } = require("./handles/screams");
const { signup, login } = require("./handles/users");
const { FBAuth } = require("./Auth");


app.get("/screams", getAllScreams);

app.post("/scream", FBAuth, postOneScreams);

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmmty = (string) => {
  if (string.trim() === "") return true;
  else false;
};

// Login route
app.post("/login", login);

// Signup route

app.post("/signup", signup);
// TODO : validate Data

exports.api = functions.https.onRequest(app);
