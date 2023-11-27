require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const server = express();
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const publickey = fs.readFileSync(
  path.resolve(__dirname, "public.key"),
  "utf-8"
);

// authentication
const auth = (req, res, next) => {
  const header = req.get("Authorization");
  if (header) {
    var token = header.split("Bearer ")[1];
    var decoded = jwt.verify(token, publickey);
    if (decoded) {
      next();
    } else {
      res.sendStatus(401);
    }
  }
};

// parsers
server.use(cors());
server.use(express.json());

server.use("/authentication", authRouter.router);
server.use("/posts", postRouter.router);
server.use("/user", auth, userRouter.router);
server.use(express.static(path.resolve(process.env.PUBLIC_DIR)));

// mongodb connection
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URL_LOCAL);
  console.log("Database Connected");
}

server.listen(process.env.PORT, () => {
  console.log("Server Started");
});
