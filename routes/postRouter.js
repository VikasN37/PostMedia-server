const express = require('express')

const router = express.Router({ mergeParams: true })
const postController = require('../controller/postController')
const authController = require('../controller/authController')

router.use(authController.protect)

router
  .route('/')
  .post(
    // authController.protect,
    postController.uploadPhoto,
    postController.resizeImage,
    postController.createPost
  )
  .get(postController.getPosts)

// router
//   .route('/')
//   .get(authController.protect, postController.getAllPosts)
//   .post(authController.protect, postController.createPost)

router
  .route('/:id')
  .patch(postController.updatePost)
  .delete(postController.deletePost)

module.exports = router
