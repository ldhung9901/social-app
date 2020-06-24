const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyBK0YOULWnDLA91bBnG6lthSXiL4u5FiA0",
  authDomain: "social-leduchung.firebaseapp.com",
  databaseURL: "https://social-leduchung.firebaseio.com",
  projectId: "social-leduchung",
  storageBucket: "social-leduchung.appspot.com",
  messagingSenderId: "510896060820",
  appId: "1:510896060820:web:014210edbc677571e5f781",
  measurementId: "G-LVESN15TP0",
};

admin.initializeApp({
  credential: admin.credential.cert(require("./admin.json")),
  databaseURL: "https://social-leduchung.firebaseio.com",
});

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/screams", (req, res) => {
  let screams = [];
  db.collection("screams")
    .orderBy("createAt", "desc")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createAt: doc.data().createAt,
        });
      });
      return res.json(screams);
    })
    .catch((error) => {
      console.log(error);
    });
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from fgh!");
});

exports.createScream = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "medthod not allowed" });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createAt: new Date().toISOString(),
  };
  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document${doc.id} create successfully` });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// Signup route

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,

    handle: req.body.handle,
  };

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then((data) => {
            return data.user.getIdToken();
          })
          .then((token) => {
            return res.status(201).json({ token: token });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err.code });
          });
      }
    });
});
// TODO : validate Data

exports.api = functions.https.onRequest(app);
