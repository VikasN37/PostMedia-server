const express = require("express");
const userController = require("../controller/user");

const router = express.Router();

router
  .patch("/edit/:id", userController.editUser)
  .delete("/delete/:id", userController.deleteUser);

exports.router = router;
