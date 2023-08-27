const mongoose = require('mongoose');
require('dotenv').config(); //(receives the url from .env file to connect to mongoose and further connect to mongodb)

mongoose.connect(process.env.MONGO_URL).then(()=>
{
    console.log('connected to database');
})
.catch((err)=>
{
    console.log('error connecting to the databse'+err);
})