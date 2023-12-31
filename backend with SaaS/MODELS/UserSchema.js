const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username:
        {
            type:String,
            required:true,
            unique:true
        },
        password:
        {
            type:String,
            required:true
        },
        email:
        {
            type:String,
            required:true
        },
        age:
        {
            type:Number
        },
        gender:
        {
            type:String
        },
        refreshToken:
        {
            type:String
        },
        profilePic:
        {
            type:String
        }
    }
);
module.exports = mongoose.model('User', userSchema);