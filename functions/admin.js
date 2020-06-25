const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(require("./admin.json")),
    databaseURL: "https://social-leduchung.firebaseio.com",
  });

const db = admin.firestore();  
module.exports = {admin, db}