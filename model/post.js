const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  date: { type: Date, default: Date.now },
  description: {type:String}, 
  img:{type: String}, 
  title:{type :String , required :true , unique:true}
});

exports.post = mongoose.model("post", postSchema);
 