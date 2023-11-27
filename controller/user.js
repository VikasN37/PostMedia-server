const model = require("../model/user");
const user = model.user;

exports.editUser = async (req, res) => {
  const id = req.params.id;
  const doc = await user.findOneAndUpdate({ _id: id }, req.body, { new: true });
  res.status(201).json(doc);
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  const doc = await user.findOneAndDelete({ _id: id });
  res.status(200).json();
};
