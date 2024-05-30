const express  =require("express");
const router=express.Router();
const isAuthenticated = require('../Middleware/Auth');
const { 
  verifyOTP,
  Login,
  getProfile ,
  Validate_session,
 
  provideEmail, completeRegistration , complete_t_Registration, 
    
    updateRegister,
    Logout}=require("../Controllers/RegisterController")
// router.route("/").get(getRegisters);
router.route("/").post(completeRegistration).get(isAuthenticated,getProfile);
router.route("/:id").put(isAuthenticated,updateRegister);
router.route("/teacher").post(complete_t_Registration);
router.route("/login").post(Login)
router.route("/provideemail").post(provideEmail)
router.route("/verifyotp").post(verifyOTP)
router.route("/validate").get(isAuthenticated,Validate_session)

router.route("/logout").get(isAuthenticated,Logout)
router.route("/session").get(isAuthenticated,Validate_session)
module.exports=router;