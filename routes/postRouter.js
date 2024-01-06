const express = require('express')

const router = express.Router({ mergeParams: true })
const postController = require('../controller/postController')
const authController = require('../controller/authController')

router
  .route('/')
  .post(authController.protect, postController.createPost)
  .get(authController.protect, postController.getPosts)

// router
//   .route('/')
//   .get(authController.protect, postController.getAllPosts)
//   .post(authController.protect, postController.createPost)

router
  .route('/:id')
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost)

module.exports = router
