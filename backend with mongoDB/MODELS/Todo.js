const mongoose = require('mongoose');

//ways to define structure of program
//things to be added to database
//eg-name email password post profile likes comments
const todoSchema = new mongoose.Schema({
    task :
    {
        type:String,
        required:true
    },
    completed:
    {
        type:Boolean,
        default:false
    }
})

//exporting schema by creating model of the schema
const Todo = mongoose.model('Todo',todoSchema);
module.exports = Todo;

//random user schema
// name:{
//     type:String,    //type of the value that name can accept
// },
// password:{
//     type:String,
//     required:true   // it throws error if someone forget to pass password
// },
// email:{
//     unique:true  // it should not be used before in database
// },
// date:{
//     default:Date.now  //if not passed then default would be this
// },
// age:{
//     type:Number,
//     min:18,
//     max:40     //gives boundries
// }