const express = require("express");
const postRouter = require("./routes/postRouter");
const app = express();

app.use(express.json());

// Routes
app.use("/api/v1/posts", postRouter);

module.exports = app;
