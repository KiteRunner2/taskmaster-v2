const mongoose = require("mongoose");

const userProfile = new mongoose.Schema(
    {
        name:String,
        firstName:String,
        lastName:String,
        email:String,
        password:String,

    },
    { collection: "users", strict: false }
  );

const user = mongoose.model("userProfile", userProfile);