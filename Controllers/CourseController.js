const express = require('express');
const connection = require('../db/db');
const app = express();
const { secretKey } = require('../db/config');
const Course =require('../Models/Course')

const add_course = async (req, res) => {
    try {
      const {  name, heading, description } = req.body;
      const newCourse = await Course.create({  name, heading, description });
      res.status(201).json(newCourse);
    } catch (error) {
      console.error('Failed to create course:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  };
  
const get_courses = async (req, res) => {
    try {
        // Fetch all courses from the database using Sequelize
        const courses = await Course.findAll({
          where: { status: 1 } // Condition to fetch courses with status 1
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
    delete_selected_courses
}