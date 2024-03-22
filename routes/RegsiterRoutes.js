const express  =require("express");
const router=express.Router();

const { 
  verifyOTP,
  Login,
  getProfile ,
  Validate_session,
 
  provideEmail, completeRegistration ,
    
    updateRegister,
    Logout}=require("../Controllers/RegisterController")
// router.route("/").get(getRegisters);
router.route("/").post(completeRegistration).get(getProfile);
router.route("/:id").put(updateRegister);

router.route("/login").post(Login)
router.route("/provideemail").post(provideEmail)
router.route("/verifyotp").post(verifyOTP)
// router.route("/profile").get(authenticate,getProfile)
router.route("/logout").get(Logout)
router.route("/session").get(Validate_session)
module.exports=router;