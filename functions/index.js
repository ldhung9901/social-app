const functions = require("firebase-functions");

const app = require("express")();

const { getAllScreams, postOneScreams } = require("./handles/screams");
const { signup, login, uploadImage } = require("./handles/users");
const { FBAuth } = require("./Auth");

app.get("/screams", getAllScreams);

app.post("/scream", FBAuth, postOneScreams);

app.post("/login", login);

app.post("/signup", signup);

app.post('/user/image',FBAuth,uploadImage)


exports.api = functions.https.onRequest(app);
