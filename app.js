var express=require('express');
var app=express();

var dotenv=require('dotenv');
var cookieParser=require('cookie-parser');
var fileUpload=require('express-fileupload')
var connectDatabase=require('./config/database.js');
var errorMiddleware = require('./middlewares/errors');
var ErrorHandler=require('./utils/errorhandler.js');

var rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xssClean=require('xss-clean');
const hpp=require('hpp');
const cors=require('cors');

const bodyParser=require('body-parser');

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

//set cookie parser
app.use(cookieParser());

//handle file uploads
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//prevent xss attacks 
app.use(xssClean());

//prevent parameter pollution
app.use(hpp());

//set up bosy parser
app.use(bodyParser.urlencoded({extended:true}));

//setup security headers
app.use(helmet());

//setup cors- Accessible by other domains
app.use(cors());
//rateLimit
const limiter=rateLimit({
    windows:10*60*1000,//10 mins
    max:100
});

app.use(limiter);
 //importing the routes
const jobs=require('./routes/jobs.js');
const auth=require('./routes/auth.js');
const user=require('./routes/user.js');


app.use('/api/v1',jobs);

app.use('/api/v1',auth);

app.use('/api/v1',user);


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
    console.log(`Error : ${err.stack}`);
    console.log('Shutting down the server due to unhandled promise rejection');
    server.close(()=>{
        process.exit(1);
    });
});

// console.log(hbjn);