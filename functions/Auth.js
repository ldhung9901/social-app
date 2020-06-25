const admin = require("firebase-admin");
const { db } = require("./admin");

exports.FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization) {
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
      console.log("No token found");
      return res.status(403).json({ error: "Unauthorization" });
    }
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        req.user = decodedToken;
        console.log(decodedToken);
        return db
          .collection("users")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      })
      .then((data) => {
        console.log("1")
        req.user.handle = data.docs[0].data().handle;
        return next();
      })
      .catch((err) => {
        return res.status(403).json({ err: err });
      });
  }