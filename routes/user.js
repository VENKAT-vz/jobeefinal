const express=require('express');
const router=express.Router();

const{  getUserProfile, 
        updatePassword, 
        updateUser,  
        getAppliedJobs,
        getPublishedJobs,
        getUsers,
        deleteUserBA,
        deleteUserBU}=require('../controllers/userController');

const {isAuthenticatedUser,authorizeRoles}=require('../middlewares/auth');

router.use(isAuthenticatedUser);

router.route('/me').get(getUserProfile);

router.route('/password/update').put(updatePassword);

router.route('/me/update').put(updateUser);

router.route('/me/delete').delete(deleteUserBU);

router.route('/jobs/published').get(getPublishedJobs);
router.route('/jobs/applied').get(getAppliedJobs);

router.route('/jobs/applied').get(authorizeRoles('admin'),getUsers);
router.route('/users/:id').delete(authorizeRoles('admin'),deleteUserBA);

module.exports=router;