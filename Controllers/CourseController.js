
const Course =require('../Models/Course')
const { check, validationResult } = require('express-validator');

const add_course = async (req, res) => {
  // Multer middleware has already processed the file upload, so you can access the file details from req.file
  // if (!req.file) {
  //   return res.status(400).json({ error: 'No file uploaded' });
  // }


  try {
    const validationRules = [
      check('name').notEmpty().withMessage('Name is required'),
      check('heading').notEmpty().withMessage('Heading is required'),
      check('description').notEmpty().withMessage('Description is required'),
      check('duration').notEmpty().withMessage('Duration is required'),
      check('image').custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Image file is required');
        }
        return true;
      }),
    ];

    // Run validation and check for errors
    await Promise.all(validationRules.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, heading, description, duration } = req.body;
    const { filename } = req.file; // Get the uploaded filename
    const filePath = `uploads/${filename}`; // Get the complete file path

    // Use the filename and file path in your database operation or other logic
    // For example, save the filename and file path along with other course details
    const newCourse = await Course.create({ name, heading, description, duration, image: filePath });
    res.status(200).json({
      msg: "Course added successfully"
    });
  } catch (error) {
    res.status(500).json({
      errormsg: 'Failed to create course'
    });
  }
};





const upload_image=(req,res)=>{
  const { filename } = req.file;
  res.status(500).json({
    errormsg: filename
  });
}

const get_courses = async (req, res) => {
    try {
        // Fetch all courses from the database using Sequelize
        const courses = await Course.findAll({
          order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
        });

        // Send the retrieved courses as JSON response
        res.status(200).json({ courses });
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
      }
}
// get course where status =1
const get_activated_courses = async (req, res) => {
  try {
    // Fetch all courses from the database using Sequelize
    const courses = await Course.findAll({
      where: { status: 1 },
      order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
    });

    // Send the retrieved courses as JSON response
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}
const update_course_status = async (req, res) => {
    try {
      const { id } = req.params; // Assuming the course ID is provided in the request parameters

      // Fetch the course by ID from the database using Sequelize
      const course = await Course.findByPk(id);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Toggle the status between 0 and 1
      const newStatus = course.status === 0 ? 1 : 0;

      // Update the course status in the database using Sequelize
      const updatedCourse = await Course.update(
        { status: newStatus },
        { where: { id } }
      );

      if (updatedCourse > 0) {
        res.status(200).json({ message: 'Course status updated successfully', courseName: course.name });
      } else {
        res.status(404).json({ error: 'No courses found or status not updated' });
      }
    } catch (error) {
      console.error('Failed to update course status:', error);
      res.status(500).json({ error: 'Failed to update course status' });
    }
  };
  const delete_course =async (req , res)=>{
    try {
      const { id } = req.params; // Assuming the course ID is provided in the request parameters

      // Check if the course with the given ID exists
      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Delete the course from the database using Sequelize
      await Course.destroy({
        where: { id } // Condition to delete the course with the specified ID
      });

      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Failed to delete course:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }
  const delete_selected_courses = async (req, res) => {
    try {
      const { ids } = req.body; // Assuming the IDs of selected courses are provided in req.body.ids as an array

      // Check if any of the selected courses do not exist
      const existingCourses = await Course.findAll({ where: { id: ids } });
      if (existingCourses.length !== ids.length) {
        return res.status(404).json({ error: 'One or more selected courses not found' });
      }

      // Delete the selected courses from the database using Sequelize
      await Course.destroy({
        where: { id: ids } // Condition to delete courses with the specified IDs
      });

      res.status(200).json({ message: 'Selected courses deleted successfully' });
    } catch (error) {
      console.error('Failed to delete selected courses:', error);
      res.status(500).json({ error: 'Failed to delete selected courses' });
    }
  };
module.exports={
    add_course,
    get_courses,
    update_course_status,
    delete_course,
    delete_selected_courses,
  get_activated_courses,
  upload_image
}