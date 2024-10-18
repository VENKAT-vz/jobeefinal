var express=require('express');
var router=express.Router();

//importing jobs controller methods
var {getJobs,newJob, getJobsInRadius, updateJob, deleteJob, getJob, jobstats}=require('../controllers/jobsController');

router.route('/jobs').get(getJobs);
router.route('/job/:id/:slug').get(getJob);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
router.route('/job/new').post(newJob);
router.route('/job/:id').put(updateJob);
router.route('/job/:id').delete(deleteJob);
router.route('/stats/:topic').get(jobstats);

module.exports=router;