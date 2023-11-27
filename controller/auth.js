const model = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = model.user;
const fs = require("fs");
const path = require("path");
const privatekey = fs.readFileSync(
  path.resolve(__dirname, "../private.key"),
  "utf-8"
);

exports.signup = (req, res) => {
  const newuser = new user(req.body);
  var token = jwt.sign({ email: req.body.email }, privatekey, {
    algorithm: "RS256",
  });
  const hash = bcrypt.hashSync(req.body.password, 5);
  newuser.token = token;
  newuser.password = hash;
  newuser.save();
  res.status(201).json(newuser);
};

exports.login = async (req, res) => {
  const doc = await user.findOne({ email: req.body.email });
  isAuth = (req.body.password === doc.password ? true :false);

 
    if (isAuth) {
      var token = jwt.sign({ email: req.body.email }, privatekey, {
        algorithm: "RS256",
      });
      doc.token = token; 
      doc.save();
      console.log("yes");
      res.json({ token });
    } else {
      res.sendStatus(401);
      console.log("no1");
    }
  
};
 