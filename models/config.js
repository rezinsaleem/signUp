const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/userdb");

connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    is_admin:{
        type:Boolean,
        required:true,
        default:false
    },
    created:{
        type: Date,
        default: Date.now,
    }
});

//collection
const collection = new mongoose.model("users", Loginschema);

module.exports = collection;