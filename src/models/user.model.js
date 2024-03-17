const mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0:27017/my_dbs');
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
  // email: {
  //   type: String,
  //   lowercase: true,
  //   required: [true, "userName can't be empty"],
  //   // @ts-ignore
  //   match: [
  //     /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
  //     "userName format is not correct",
  //   ],
  //   unique: true,
  // },
  role: Number
})

UserSchema.pre("save",async function(){
  var user = this;
  if(!user.isModified("password")){
      return
  }
  try{
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password,salt);
      user.password = hash;
  }catch(err){
      throw err;
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
      console.log('----------------no password',this.password);
      // @ts-ignore
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      return isMatch;
  } catch (error) {
      throw error;
  }
};

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel;

