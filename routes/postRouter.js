const express = require('express');

const router = express.Router();
const postController = require('../controller/postController');
const authController = require('../controller/authController');

router
  .route('/')
  .get(authController.protect, postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router
  .route('/:id')
  .get(authController.protect, postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

router
  .route('/:userId')
  .post(authController.protect, postController.createPostByuser)
  .get(authController.protect, postController.getUserPosts);

module.exports = router;
