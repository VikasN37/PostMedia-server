const moongoose = require("mongoose");
const { Schema } = moongoose;

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilephoto: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
  },
  token: String,
});

exports.user = moongoose.model("user", userSchema);
