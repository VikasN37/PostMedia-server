const express = require('express')

const router = express.Router()
const userController = require('../controller/userController')
const authController = require('../controller/authController')

router.route('/signup').post(authController.signup)
router.route('/login').post(authController.login)
router.route('/logout').post(authController.protect, authController.logout)

router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword)

router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').patch(authController.resetPassword)

router.use(authController.protect)

router
  .route('/')
  // .get(userController.getAllUser)
  .delete(userController.deleteUser)
  .get(userController.getUser)
  .patch(
    userController.uploadProfilePhoto,
    userController.resizeImage,
    userController.updateUser
  )

module.exports = router
