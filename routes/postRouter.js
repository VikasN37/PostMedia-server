const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");

router.param("id", (req, res, next, val) => {
  console.log(`value of id is ${val}`);
  next();
});

router
  .route("/")
  .get(postController.getAllPosts)
  .post(postController.checkBody, postController.createPost);

router
  .route("/:id")
  .get(postController.getOnepost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
