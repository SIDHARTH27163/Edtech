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
 get_courses_by_d_id,get_courses_by_id,
   upload_image, add_course, get_courses , update_course_status, delete_course,delete_selected_courses,get_activated_courses,
   user_courses
   }=require("../Controllers/CourseControler")
      router.route("/").post(upload.single("image"),isAuthenticated,add_course).get(get_courses);
      router.route("/get").get(get_activated_courses);
      router.route("/coursesbyuser").get(isAuthenticated,user_courses);
      router.route("/:id").put(update_course_status).delete(delete_course).get(get_courses_by_d_id);
      router.route("/view_by/:id").get(get_courses_by_id);

    
      router.route('/upload').post(upload.single("image"),upload_image)
module.exports=router;