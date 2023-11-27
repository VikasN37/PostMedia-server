const express = require("express");
const postController = require("../controller/post");

const router = express.Router();

router
  .get("/", postController.getPosts)
  .get("/:id", postController.getOnePost)
  .post("/create", postController.createPost)
  .patch("/edit/:id", postController.editPost)
  .delete("/delete/:id", postController.deletePost);

exports.router = router;
