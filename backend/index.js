const express = require('express')
const userRoutes = require('./controllers/userRouters')
const PORT = 5000;
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:8000'];

// app.use(cores({
//     origin: function(origin,callback)
//     {
//         if(!origin) return callback(null,true);
//         if(allowedOrigins.includes(origin)) return callback(null,true);
//         else{
//             return callback(new Error('Not allowed by CORS'));
//         }
//     }
// }));


app.use('/userapis' , userRoutes); 


app.get('/',(req,res) =>
{
    res.send('the api is working');
});

app.listen(PORT,()=>
{
    console.log(`server is ${PORT}`);
})