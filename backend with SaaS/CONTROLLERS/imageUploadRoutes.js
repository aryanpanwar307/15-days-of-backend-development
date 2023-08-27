const express = require('express');
const router = express.Router();
require('dotenv').config();
const cloudinary = require('cloudinary').v2;//the way we import cloudinary after installing
const multer = require('multer');//multer import 
const User = require('../MODELS/UserSchema');

//this way we write the name key and secret in env file and we extract it here
cloudinary.config({
    cloud_name : process.env.CD_CLOUD_NAME,
    api_key : process.env.CD_API_KEY,
    api_secret : process.env.CD_API_SECRET
})

//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.

//multer creates buffer that is it breaks the whole image into pixels and store it 
//as a binary number which indicate the colour of a particular pixel and 
//using .memoryStorage() it stores that binary in a variable

const storge = multer.memoryStorage();
const upload = multer({ storage : storge});

//we wont be using the storagre in nodejs application we would be using space in the cloudinary
//as soon as we get the image from frontend this api calls middleware upload and it converts the into binary

//inside the header part we write Content-Type = multipart/form-data
router.post('/uploadprofilepic', upload.single('myimage'),async(req,res)=>{ //upload.single is the multer middleware receives myimage
    const file = req.file;//inside body form data we write myimage and then select file instead of text and then selesct any image from computer
    const {userid} = req.body;
    if(!file){
        return res.status(400).json({error:'no image file provided'});
    }

    const existingUser = await User.findById(userid);
    
    if(!existingUser){
        res.status(400).json({error:'no user found'})
    }

    cloudinary.uploader.upload({resource_type:'auto'},async(error,result)=>{
        // res.send(result)
        if(error){
            console.error('clouding upload error',error);
            return res.status(500).json({error:'error uploading image to cloudinary'})
        }
        //result have many variables inside it but we only need the url to image so we will extract the url
        existingUser.profilePic = result.secure_url;

        await existingUser.save();
        res.json({ imageUrl : result.url , message:'pp uploaded successfully'})
    }).end(file.buffer);
});
console.log('hi');

module.exports = router;