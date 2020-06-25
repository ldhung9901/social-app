const { db } = require("../admin");

exports.getAllScreams = (req, res) => {
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
  }
  exports.postOneScreams = (req, res) => {
    if (req.body.body.trim() === "") {
      return res.status(400).json({ error: "Body must note be empty" });
    }
  
    const newScream = {
      body: req.body.body,
      userHandle: req.user.handle,
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
  }