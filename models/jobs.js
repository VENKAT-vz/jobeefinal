var mongoose=require('mongoose');
var validator=require('validator');//validate our inputs
var slugify=require('slugify');
var geoCoder=require('../utils/geocoder')


var jobSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Please enter job title'],
        trim:true,
        maxlength:[100,'Job title cannot exceed 100 char']
    },
    slug:String,
    description:{
        type:String,
        required:[true,'Please enter job description'],
        maxlength:[1000,'Job description cannot exceed 1000 char']
    },
    email:{
        type:String,
        validate : [validator.isEmail, 'Please add a valid email address.']
    },
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    location:{
        type:{
            type:String,
            enum:['Point']
        },
        coordinates:{
            type:[Number],
            index:'2dsphere'
        },
        formattedAddress:String,
        city:String,
        state:String,
        zipcode:String,
        country:String
    },
    company:{
        type:String,
        required:[true,'Please add company name']
    },
    industry:{
        type:[String],
        required:[true, 'Please enter industry'],
        enum:{
            values:[
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication.Banking',
                'others'
            ],
            message:'Please select correct options for industry'
        }
    },
    jobType:{
        type:String,
        required:[true,'Please enter job type'],
        enum:{
            values:[
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message:'Please select correct options for job type '
        }
    },
    minEducation:{
        type:String,
        required:[true,'Please enter minimum Education'],
        enum:{
            values:[
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message:'Please select correct options for Education.'
        }
    },
    positions:{
        type:Number,
        default:1
    },
    experience:{
        type:String,
        required:[true,'please enter job experience'],
        enum:{
            values:[
                'No Experience',
                '1 Year - 2 Years',
                '2 Year - 5 Years',
                '5 Years +',

            ],
            message:'Please select correct options for experience'
        }
    },
    salary:{
        type:Number,
        required:[true,'Please enter expected salary for this job.']
    },
    postingDate:{
        type:Date,
        default:Date.now
    },
    lastDate:{
        type:Date,
        default:new Date().setDate(new Date().getDate()+7)
    },
    applicantsApplied:{
        type:[Object],
        select:false,
    }
});

//creating job slug before saving

jobSchema.pre('save',function(next){
    this.slug=slugify(this.title,{lower:true});
    next();
});

//setting up location
jobSchema.pre('save',async function(next){
    const loc=await geoCoder.geocode(this.address);
    
    this.location={
        type:'Point',
        coordinates:[loc[0].longitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipcode:loc[0].zipcode,
        country:loc[0].country
    }
})

module.exports=mongoose.model('Job',jobSchema)