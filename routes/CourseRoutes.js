const express  =require("express");
const router=express.Router();
const { 
   get_courses,
      add_course,
      update_course_status,
      delete_course,
      delete_selected_courses
   
   }=require("../Controllers/CourseController")
      router.route("/").post(add_course).get(get_courses).delete(delete_selected_courses);
      router.route("/:id").put(update_course_status).delete(delete_course);
      // router.route("/delete_selected").delete(delete_selected_courses);
module.exports=router;