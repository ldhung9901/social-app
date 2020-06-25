const { db, adminStore } = require("../admin");
const  config  = require("../config");
const firebase = require("firebase");
const admin = require("firebase-admin");


const noImg = "no-img.png";
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else false;
};


firebase.initializeApp(config);



exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Email must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Email must be valid";
  }

  if (isEmpty(newUser.password)) {
    errors.password = "Must not be empty";
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Password must match";
  }

  if (isEmpty(newUser.handle)) {
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
              imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
              userId: userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
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
  if (isEmpty(user.email)) {
    errors.email = "Email must not be empty";
  }
  if (isEmpty(user.password)) {
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
};
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  let imageFileName;
  let imageToBeUploaded = {};
  const busboy = new BusBoy({ headers: req.headers });
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // image.png

    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
   
    imageToBeUploaded = { filepath:filepath, mimetype:mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });
  
  busboy.on("finish", () => {
    console.log(imageToBeUploaded.mimetype)
    admin.storage()
      .bucket(config.storageBucket)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
          console.log("2")
        let imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db
          .collection("users").doc("12345")
          .update({ imageUrl: imageUrl });
      })
      .then(() => {
        return res.json({ messages: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ err: err.code });
      });
  });
  busboy.end(req.rawBody);
};
