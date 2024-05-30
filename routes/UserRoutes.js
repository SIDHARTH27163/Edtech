const express  =require("express");
const router=express.Router();
const multer=require("multer")
const path =require("path");
const isAuthenticated = require('../Middleware/Auth');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
     cb(null, 'uploads'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
     // Generate a unique name for the file
     const uniqueSuffix = Date.now() + '1231' ;
     // Extract the original file extension
     const fileExtension = path.extname(file.originalname);
     // Construct the new file name with the unique suffix and original extension
     const newFileName = `${uniqueSuffix}${fileExtension}`;
     // Store the complete path of the uploaded file
     const filePath = path.join('uploads', newFileName);
     cb(null, newFileName); // Use the new file name for storing
     req.filePath = filePath; // Attach the file path to the request object
  }
});
const upload = multer({ storage: storage });
const { 
    addtocart , getusercartitem , addcousematerial,
    getUserCourseMaterials,
    delete_material, make_payment
   }=require("../Controllers/UserController")
  // router.route("/").get(getRegisters);
  router.route("/cart").get(isAuthenticated,getusercartitem);
  router.route("/add-to-cart/:id").post(isAuthenticated,addtocart);
  router.route("/coursematerial").post(isAuthenticated , addcousematerial).get(isAuthenticated , getUserCourseMaterials)
  router.route("/coursematerial/:id").delete(delete_material);
  router.route("/make-payment/:id").post(isAuthenticated , make_payment);
  module.exports=router;