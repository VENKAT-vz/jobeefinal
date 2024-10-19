var ErrorHandler=require('../utils/errorhandler');

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;

    if(process.env.NODE_ENV==='development'){
        res.status(err.statusCode).json({
            success:false,
            error:err,
            errMessage:err.message,
            stack:err.stack
        });
    }

    if(process.env.NODE_ENV==='production '){
        let error={...err};
        error.message=err.message;

        //wrong mongoose object id error
        if(err.name==='CastError'){
            const message = `Resource not found. Invalid: ${err.path}`;
            error= new ErrorHandler(message,404);
        }

        //handling mongoose validation error
        if(err.name === 'ValidationError'){
            const message=Object.values(err.errors).map(value=>value.message);
            error=new ErrorHandler(message,400);
        }

        //handling wrong jwt token error
        if(err.name === 'JsonWebTokenError'){
            const message='JSON web token is invalid. try again ';
            error=new ErrorHandler(message,500);
        }

        //handling expired jwt token error
        if(err.name === 'TokenExpiredError'){
            const message='JSON web token is expired. try again ';
            error=new ErrorHandler(message,500);
        }

        //handles mongoose duplicate key error
        if(err.code===11000){
            const message=`Duplicate  ${Object.keys(err.keyValue)} entered .`;
            error = new ErrorHandler(message,400);
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal Server error'
        });
    }


    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })


}