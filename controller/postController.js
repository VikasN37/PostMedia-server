const fs = require("fs");

exports.checkBody = (req, res, next) => {
  if (!req.body.title || !req.body.description) {
    return res.status(400).json({
      status: "fail",
      message: "missing title or description",
    });
  }
  next();
};

const posts = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`, "utf-8"));
exports.getAllPosts = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      posts,
    },
  });
};

exports.getOnepost = (req, res) => {
  const searchQuery = req.params.searchQuery;
  const post = posts.find((auto) => auto.title === searchQuery);
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
};

exports.createPost = (req, res) => {
  // console.log(req.body);
  res.status(200).send("Done");
};
exports.updatePost = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      posts: "updated",
    },
  });
};

exports.deletePost = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
