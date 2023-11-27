const model = require("../model/post");
const post = model.post;

exports.createPost =  (req, res) => {
  const newpost = new post(req.body);
  newpost.save(); 
  res.status(201).json(newpost);
};
 
exports.getPosts = async (req, res) => {
  const allposts = await post.find();
  res.status(200).json(allposts);
};
exports.getOnePost = async (req, res) => {  
  const id = req.params.id;
  const doc = await post.findById({_id:id});
  res.status(200).json(doc);
};

exports.editPost = async (req, res) => {
  const id = req.params.id;
  const doc = await post.findOneAndUpdate({ _id: id }, req.body, { new: true });
  res.status(201).json(doc);
};

exports.deletePost = async (req, res) => {
  const id = req.params.id;
  const doc = await post.findOneAndDelete({ _id: id });
  res.status(200).json();
}; 
