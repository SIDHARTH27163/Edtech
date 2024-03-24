const express  =require("express");
const router=express.Router();
const multer=require("multer")
const path =require("path")
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
   get_courses,
      add_course,
      update_course_status,
      delete_course,
      delete_selected_courses,
    get_activated_courses,
    upload_image

   }=require("../Controllers/CourseController")
      router.route("/").post(upload.single("image"),add_course).get(get_courses).delete(delete_selected_courses);
      router.route("/get").get(get_activated_courses);
      router.route("/:id").put(update_course_status).delete(delete_course);
      router.route('/upload').post(upload.single("image"),upload_image)
      // router.route("/delete_selected").delete(delete_selected_courses);
module.exports=router;