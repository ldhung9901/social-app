const { db } = require("../admin");
const { config } = require("firebase-functions");
const firebase = require('firebase')

firebase.initializeApp(config)
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};
  if (isEmmty(newUser.email)) {
    errors.email = "Email must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Email must be valid";
  }

  if (isEmmty(newUser.password)) {
    errors.password = "Must not be empty";
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Password must match";
  }

  if (isEmmty(newUser.handle)) {
    errors.handle = "Must not be empty";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  let tokenUser;
  let userId;

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
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then((token) => {
            tokenUser = token;
            const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createAt: new Date().toISOString(),
              userId: userId,
            };
            return db.doc(`/users/ ${newUser.handle}`).set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token: tokenUser });
          })
          .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
              return res.status(400).json({ email: "Email already in use" });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
      }
    });
};
exports.login = (req, res) => {
    let errors = {};
    const user = {
      email: req.body.email,
      password: req.body.password,
    };
    if (isEmmty(user.email)) {
      errors.email = "Email must not be empty";
    }
    if (isEmmty(user.password)) {
      errors.password = "Password must not be empty";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }
  
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token: token });
      })
      .catch((err) => {
        console.log(err);
        if (err.code === "auth/wrong-password") {
          return res.status(403).json({
            general: "Wrong password",
          });
        }
        res.status(500).json({ error: err.code });
      });
  }
