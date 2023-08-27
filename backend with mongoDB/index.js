const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 9000;
require('dotenv').config(); // it also require the url where the db is present
const app = express();
require('./db');    //connect backend with mongoose and further with db
const Todo = require('./MODELS/Todo');   //importing Todo from other folder which has values 
//that is to be added in db 

app.use(bodyParser.json());
app.use(cors());

//basic api
app.get('/',(req,res)=>
{
    res.send('API works and i have re deployed')
})

//to get the whole data initially
app.get('/gettodos',async (req,res)=>
{
    const alltodos = await Todo.find()
    res.json(alltodos);
})

// api to add data into schema
app.post('/addtodo', async(req,res)=>
{
    const {task,completed} = req.body;  //it receives whatever written in body in postman(frontend)
    //and stores it in a object {task,completed}

    const todo = new Todo({task,completed})  // we make todo a new Todo object and pass the req.body vala object

    const saveTodo = await todo.save();  //to save this into db

    res.json({
        message:'success',
        saveTodo:saveTodo
    })  //it is the response seen in postman i.e the result after api call
})
app.listen(PORT,()=>
{
    console.log(`server is ${PORT}`)
})
