var express=require('express');
var router=express.Router();

const {isAuthenticatedUser,authorizeRoles}=require('../middlewares/auth');

//importing jobs controller methods
var {getJobs,newJob, getJobsInRadius, updateJob, deleteJob, getJob, jobstats, applyJob}=require('../controllers/jobsController');

router.route('/jobs').get(getJobs);
router.route('/job/:id/:slug').get(getJob);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
router.route('/job/new').post(isAuthenticatedUser,authorizeRoles("employeer","admin"),newJob);
router.route('/job/:id').put(isAuthenticatedUser,authorizeRoles('employeer','admin'),updateJob);
router.route('/job/:id').delete(isAuthenticatedUser,authorizeRoles('employeer','admin'),deleteJob);
router.route('/stats/:topic').get(jobstats);

router.route('/job/:id/apply').put(isAuthenticatedUser,authorizeRoles('user','admin'),applyJob);
module.exports=router;