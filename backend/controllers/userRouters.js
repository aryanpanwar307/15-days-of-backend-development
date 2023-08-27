const express = require('express')
const router = express.Router();
const fs = require('fs');
const path = require('path');

// to give path to the file where all the data is present
const dataFilePath = path.join(__dirname, '../userDataBase.json');

function readDataFromFile()
{
    // to get data from that path directory we make 
    //a function and extract data using fs into a 
    //variable and convert it into json
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
}

function writeDataToFile(data)
{
    // to set data from frontend to the data path directory we make 
    //a function and extract data using fs
    //and write the updated value and convert it into json
    fs.writeFileSync(dataFilePath, JSON.stringify(data,null,2));
}

//get api for all users
router.get('/users',(req,res)=>
{
    const users = readDataFromFile();
    res.send(users);
})

//get api for some specific user among users
router.get('/users/:id',(req,res)=>
{
    const users = readDataFromFile();
    const userId = req.params.id;

    const user = users.find(user => user.id === parseInt(userId));
    if(user)
    {
        res.send(user);
    }
    else{
        res.status(404).send({
            error:'user not found'
        })
    }
})

//post api to add some data to backend from frontend
router.post('/users', (req,res)=>
{
    const user = req.body;
    //console.log('user',user);

    const users = readDataFromFile();
    //adding new id to the new data we are going to upload to backend
    user.id = new Date().getTime();
    //adding a new object into the data array with all the value 
    //written in frontend
    users.push(user);
    writeDataToFile(users);
    res.send(user);
})

//put api to update existing data in backend from frontend 
router.put('/users/:id',(req,res)=>
{
    const users = readDataFromFile();
    const userId = req.params.id;
    const updateUser = req.body;

    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    if(userIndex == -1)
    {
        return res.status(404).send({
            error:'user not found'
        })
    }
    users[userIndex] = {
        ...users[userIndex], ...updateUser
    }
    writeDataToFile(users);
    res.send(users[userIndex]);
})

//delete api to delete data from backend
router.delete('/users/:id',(req,res)=>
{
    const users = readDataFromFile();
    const userId = req.params.id;
    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    if(userIndex == -1)
    {
        return res.status(404).send({
            error:'user not found'
        })
    }

    users.splice(userIndex,1);
    writeDataToFile(users);
    res.send({
        message:`id ${userIndex} has been deleted`
    });

})


router.get('/',(req,res) => res.send({
    message : 'hi' ,
    path : dataFilePath
}))

module.exports = router;