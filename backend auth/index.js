const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 7000;
require('dotenv').config(); // it also require the url where the db is present
const app = express();
require('./db');
const User = require('./MODELS/UserSchema'); //the schema is saved in a variable to use here
const bcrypt = require('bcrypt')   //installed bcrypt to make salt and hashed password
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

//middleware that is it is called everytime a req is made
function authenticateToken(req,res,next)
{
    const token = req.headers.authorization.split(' ')[1]; // this extract the value of the token extracted from the postman req authorization 
    console.log('token',token) // extract the value of id from req body postman
    if(!token)
    {
        const error = new Error('Token not found');
        next(error);
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userid = decoded.id;
        console.log(decoded);
        req.id = userid;
        next();
    }
    catch(err){
        next(err);//error handeling middleware
    }
}

app.get('/',(req,res)=>
{
    res.json({message:'API is working'})
})

//register api
app.post('/register' , async(req,res)=>
{

    try
    {
        //putting all the parameters to be filled while registering in a variable
        const {username, password, email, age, gender}=req.body;
        //checking that if some has registered with the same email before
        const existingUser = await User.findOne({email});
        //if that is the case then already exist message is shown
        if(existingUser)
        {
            return res.status(409).json({message:'already exist'})
        }
        //else if new user then ->
         // to secure your password we need bcrypt beacause anyone can hack database 
         // salt is basically the random set of characters
         //(10) means it will mix the character 10 times
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        //bcrypt.hash is used to mix the password with salt

        console.log('salt',salt);
        console.log('hashedPassword',hashedPassword);

        //it will create the new user in database
        const newUser = new User(
            {
                username,
                password:hashedPassword,
                email,
                age,
                gender
            }
        );

        //to save the details inside the database
        await newUser.save();
        //this is used as a prompt in frontend to diaplay the messsage
        res.status(201).json({message:'user registered'})
    } 

    //if there is any error in this process then catch function works
    catch(err)
    {
        res.status(500).json({message: err.message})
    }
})
//login api with access and refresh token
app.post('/login', async(req,res,next)=> 
{
    try
    {
        const {email,password} = req.body;
        const existingUser = await User.findOne({email})
        //there is no such user in the datatbase
        if(!existingUser)
        {
            res.status(401).json({message:'invalid username'});
        }
        //if information is correct about the user
        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);
        if(!isPasswordCorrect)
        {
            return res.status(401).json({message:'invalid password'})
        }
        //if password is correct then we create a token(access and refresh both)and print user loggen in successfully
        const accesstoken = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
        const refreshToken = jwt.sign({id: existingUser._id}, process.env.JWT_REFRESH_SECRET_KEY);

        //to add the refresh token in the database
        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        //to store the refresh token in the cookies to gain access anytime 
        res.cookie('refreshToken', refreshToken , { httpOnly:true,path: '/refreshToken'})
        res.status(200).json(
        {
            accesstoken,
            refreshToken,
            message:'user logged in successfully'
        })
    }
    catch(err)
    {
        next(err);
    }
})
//provide data of a specific profile ,when logged in, through counter check of access token using a 
//middleware function
app.get('/getmyprofile',authenticateToken, async(req,res)=>
{
    //here authentication act as a middle ware thath is before starting the function written below the 
    //authentication function will be checked and then further work will be done.
    const id = req.id; 
    const user = await User.findById(id);
    //user.password = undefined;
    res.status(200).json({user});
})

app.get('/refresh_token', async(req,res,next)=>
{
    const token = req.cookies.refreshToken;
    res.send(token);

    if(!token)
    {
        const error = new Error('token not found');
        next(error);
    }
    jwt.verify(token,process.env.JWT_REFRESH_SECRET_KEY, async(err,decoded)=>
    {
        if(err)
        {
            const error = new Error('Inavlid token');
            next(error);
        }

        const id = decoded.id;
        const existingUser = await User.findById(id);

        if(! existingUser || token!==existingUser.refreshToken)
        {
            const error = new Error('Inavlid token');
            next(error); 
        }

        const accesstoken = jwt.sign( { id:existingUser._id }, process.env.JWT_SECRET_KEY, {expiresIn:'1h'});
        const refreshToken = jwt.sign( { id:existingUser._id}, process.env.JWT_REFRESH_SECRET_KEY);

        await existingUser.save();
        res.cookies('refreshToken',refreshToken, { httpOnly: true, path:'/refresh_token'})

        res.status(200).json({
            accesstoken,
            refreshToken,
            message:"access token updated"
        })
    })
});

app.post('/getbygender', async(req,res)=>{
    const {gender} = req.body
    const users = await User.find({gender:gender})
    res.json({users})
})

app.get('/getallusers', async(req,res)=>{
    const user = await User.find()
    res.json({user})
})

app.post('/sortusers',async(req,res)=>{
    const{sortby, order} = req.body; 
    const sort = {[sortby] : order};//sort function accepts two variables on which basis sorting happens
    const users = await User.find().sort(sort);//the inbuilt function to grt the sorted values
    res.json({users});
})
//error handling middleware
app.use((err,req,res,next) =>
{
    console.log('error middleware called',err);
    res.status(500).json({message:err.message});
}) 

app.listen(PORT,()=>
{
    console.log(`port is ${PORT}`)
})