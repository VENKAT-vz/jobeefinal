//get all jobs // api/v1/jobs
var Job=require('../models/jobs');

var ErrorHandler=require('../utils/errorhandler');

var catchAsyncErrors=require('../middlewares/catchAsyncErrors');
var geoCoder=require('../utils/geocoder');
var APIFilters=require('../utils/apiFilters');

exports.getJobs= catchAsyncErrors (async (req,res,next)=>{

    const apiFilter=new APIFilters(Job.find(),req.query)
                        .filter()
                        .sort()
                        .limitFields()
                        .SearchByQuery()
                        .pagination();

    var jobs=await apiFilter.query;

    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs
    });
});

//Create new job -> like /api/v1/job/new

exports.newJob= catchAsyncErrors (async (req,res,next)=>{
    var job= await Job.create(req.body);
    res.status(200).json({
        success:true,
        message:'Job created',
        data:job
    });
});


//get a job using id and slug -> /api/v1/job/:id/:slug
exports.getJob= catchAsyncErrors (async(req,res,next)=>{

    const job=await Job.find({$and: [{_id:req.params.id},{slug:req.params.slug}]});
    if(!job || job.length===0){
        return next(new ErrorHandler('Job not found', 404));
    }
    res.status(200).json({
        success:true,
        data:job
    });
});

//update a job ->/api/v1/job/:id

exports.updateJob= catchAsyncErrors (async (req,res,next)=>{
    let job=await Job.findById(req.params.id);
    if(!job){
        return next(new ErrorHandler('Job not found', 404));
    }

    job=await Job.findByIdAndUpdate(req.params.id, req.body,{
       new:true,
       runValidators:true 
    });

    res.status(200).json({
        success:true,
        message:'Job is updated',
        data:job
    });
});

//delete a job -> /api/v1/job/:id

exports.deleteJob= catchAsyncErrors (async(req,res,next)=>{
    let job =await Job.findById(req.params.id);
    if(!job){
        return next(new ErrorHandler('Job not found', 404));
    }

    job=await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        message:'Job is deleted'
    });
});


//search job within the radius -> /api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius=catchAsyncErrors (async(req,res,next)=>{
    const {zipcode,distance}=req.params;

    //getting latitude and longitude from geocode with zip

    var loc=await geoCoder.geocode(zipcode);
    const latitude=loc[0].latitude;
    const longitude=loc[0].longitude;

    const radius=distance/3963;

    const jobs=await Job.find({
        location:{$geoWithin:{$centerSphere:[[longitude,latitude],radius]

        }}
    });

    res.status(200).json({
    success:true,
    results:jobs.length,
    data:jobs
    })
});


//get stats about a job(topic)->/api/v1/stats/:topic
exports.jobstats= catchAsyncErrors (async (req,res,next)=>{
    const stats=await Job.aggregate([
        {
            $match: { $text: { $search: "\"" + req.params.topic + "\"" } }
        },
        {
            $group:{
                _id: {$toUpper:'$experience'},
                totalJobs:{$sum:1},
                avgPosition:{$avg:'$positions'},
                avgSalary:{$avg:'$salary'},  //$avg ->mongodb inbuilt
                minSalary:{$min:'$salary'},
                maxSalary:{$max:'$salary'}
            }
        }
    ]);

    if(stats.length===0){
        return next(new ErrorHandler(`No stats found for - ${req.params.topic}`, 200));
    }

    res.status(200).json({
        success:true,
        data:stats
    });
});