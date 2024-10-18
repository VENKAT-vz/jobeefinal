var express=require('express');
var app=express();
var dotenv=require('dotenv');

var connectDatabase=require('./config/database.js');
var errorMiddleware = require('./middlewares/errors');
var ErrorHandler=require('./utils/errorhandler.js');

//setting up the config.env file variables
dotenv.config({path:'./config/config.env'});


//handling uncaught exceptions
process.on('uncaughtException',err=>{
    console.log(`Error:${err.message}`);
    console.log('shutting down due to uncaught exception');
    process.exit(1);
});

//connecting database
connectDatabase();

//setup body parse to use in postman
app.use(express.json());



 //importing the routes
var jobs=require('./routes/jobs.js');
app.use('/api/v1',jobs);

//handle unhandled routes
app.all('*',(req,res,next)=>{
    next(new ErrorHandler(`${req.originalUrl} route not found`,404));
});

//middleware to handle errors
app.use(errorMiddleware);

const PORT =process.env.PORT;
const server = app.listen(PORT,()=>{
    console.log(`Server is connected on ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

//Handling unhandled promise rejections
process.on('unhandledRejection',err=>{
    console.log(`Error : ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection');
    server.close(()=>{
        process.exit(1);
    });
});

// console.log(hbjn);