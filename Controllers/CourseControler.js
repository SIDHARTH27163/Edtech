
const Course = require('../Models/Course')
const { check, validationResult } = require('express-validator');

const fs = require('fs');
const add_course = async (req, res) => {
  const user = req.user;
  const userId = user.id;

  try {
    const validationRules = [
      check('d_id').notEmpty().withMessage('Domain is required || Please Select a domain'),
      check('c_name').notEmpty().withMessage('Course Name is required'),
      check('c_details').notEmpty().withMessage('Course Details is required'),
      check('timing_from').notEmpty().withMessage('Timing from is required'),
      check('timing_to').notEmpty().withMessage('Timing to is required'),
      check('start_date')
        .notEmpty().withMessage('Course Start Date is required')
        .custom((value) => {
          const currentDate = new Date();
          const selectedDate = new Date(value);

          const currentDateString = currentDate.toISOString().slice(0, 10); // Get "YYYY-MM-DD" format from ISO string

          // Regular expression to match the "YYYY-MM-DD" format
          const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

          // Check if the input value matches the expected date format and is a valid date
          if (!dateFormat.test(value) || isNaN(selectedDate.getTime())) {
            throw new Error(`Invalid date format. Please use "${currentDateString}" format`);
          }

          if (selectedDate < currentDate) {
            throw new Error('Start date must be at least one week forward from the current date');
          }

          const oneWeekLater = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
          if (selectedDate < oneWeekLater) {
            throw new Error('Start date must be at least one week forward from the current date');
          }

          return true;
        }),
      check('price').notEmpty().withMessage('Course Price is required'),
      check('c_duration')
        .notEmpty().withMessage('Duration is required')
        .isFloat({ min: 1, max: 3 }).withMessage('Course duration must be between 1 to 3 months'),
      check('image').custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Image file is required');
        }
        return true;
      }),
    ];

    // Run validations
    await Promise.all(validationRules.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create new course if validation passes
    const { d_id, c_name, c_details, timing_from, timing_to, start_date, price, c_duration } = req.body;
    const { filename } = req.file;
    const filePath = `uploads/${filename}`;

    const newCourse = await Course.create({
      d_id,
      u_id: userId,
      c_name,
      c_details,
      timing_from,
      timing_to,
      start_date,
      price,
      c_duration,
      image: filePath
    });

    res.status(200).json({
      msg: `Course added successfully with course name ${newCourse.c_name}`
    });
  } catch (error) {
    res.status(500).json({
      errormsg: error.message
    });
  }
};






const upload_image = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { filename } = req.file;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    res.status(200).json({ url: imageUrl }); // Return the image URL in JSON format
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

const get_courses = async (req, res) => {
  try {
    // Fetch all courses from the database using Sequelize
    const courses = await Course.findAll({});

    // Send the retrieved domains as JSON response
    res.status(200).json({ "course":courses });
  } catch (error) {
    console.error('Failed to fetch course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
}
// get course where status =1
const get_activated_courses = async (req, res) => {
  try {
    // Fetch all courses from the database using Sequelize
     // Fetch all courses from the database using Sequelize
     const courses = await Course.findAll({
      where: { status: 1 },
      order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
    });
    res.status(200).json({ "courses": courses });
  } catch (error) {
    console.error('Failed to fetch course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
}
const user_courses = async (req, res) => {
  const user = req.user;
  const userId = user.id;

  try {
    // Fetch courses where u_id matches userId and status is 1, ordered by c_name
    const courses = await Course.findAll({
      where: { u_id: userId, status: 1 },
      order: [['c_name', 'ASC']], // Order by course name in ascending order
    });

    // Send the retrieved courses as JSON response
    res.status(200).json({ "courses": courses });
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};


// const coursesbyuser = async (req, res) => {
//   console.log('coursesbyuser controller called');
//   // Your code here
// };


const get_courses_by_d_id = async (req, res) => {
  try {
    const { id } = req.params;

    const courses = await Course.findAll({
      where: {
        d_id: id,
        status: 1,
      },
      order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
    });

    // Send the retrieved domains as JSON response
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Failed to fetch course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
}
const get_courses_by_id = async (req, res) => {
  try {
    const { id } = req.params;


    const course = await Course.findByPk(id);



    res.status(200).json({ course });



  } catch (error) {

    res.status(500).json({ error: 'Failed to get course by id' });
  }
}
const update_course_status = async (req, res) => {
  try {
    const { id } = req.params;


    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Toggle the status between 0 and 1
    const newStatus = course.status === 0 ? 1 : 0;


    const updateddomain = await Course.update(
      { status: newStatus },
      { where: { id } }
    );

    if (updateddomain > 0) {
      res.status(200).json({ message: 'course status updated successfully', domainName: course.c_name });
    } else {
      res.status(404).json({ error: 'No course found or status not updated' });
    }
  } catch (error) {
    console.error('Failed to update course status:', error);
    res.status(500).json({ error: 'Failed to update course status' });
  }
};
const delete_course = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ error: 'course not found' });
    }

    // Delete the image file from the uploads folder
    const imagePath = course.image; // Assuming image path is stored in domain.image
    if (imagePath) {
      fs.unlinkSync(imagePath); // Synchronously delete the file
    }

    await Course.destroy({
      where: { id }
    });

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Failed to delete Course:', error);
    res.status(500).json({ error: 'Failed to delete Course' });
  }
};

const delete_selected_courses = async (req, res) => {
  try {
    const { ids } = req.body;

    const existingDomains = await Course.findAll({ where: { id: ids } });
    if (existingDomains.length !== ids.length) {
      return res.status(404).json({ error: 'One or more selected domains not found' });
    }

    // Delete image files for all selected domains
    existingDomains.forEach(domain => {
      const imagePath = domain.image;
      if (imagePath) {
        fs.unlinkSync(imagePath); // Synchronously delete the file
      }
    });

    await Course.destroy({
      where: { id: ids }
    });

    res.status(200).json({ message: 'Selected Courses deleted successfully' });
  } catch (error) {
    console.error('Failed to delete selected Courses:', error);
    res.status(500).json({ error: 'Failed to delete selected domains' });
  }
};

module.exports = {
  add_course,
  get_courses,
  update_course_status,
  delete_course,
  delete_selected_courses,
  get_activated_courses,
  upload_image,
  user_courses,
  get_courses_by_d_id,
  get_courses_by_id,

}