const { check, validationResult } = require('express-validator');
const connection = require('../db/db');
const fs = require('fs');
const CourseMaterial = require('../Models/CourseMaterial');
const addtocart = async (req, res) => {
    try {
         const { id } = req.params; 
      
        const user = req.user;

        // Check if the course is activated
        connection.query(
            'SELECT * FROM courses WHERE id = ? AND status = "1"',
            [id],
            (err, courseRows) => {
                if (err) {
                    console.error('Error checking course activation:', err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                }

                if (courseRows.length === 0) {
                    res.status(400).json({ error: "Course not activated or does not exist" });
                    return;
                }

                // Check if the course is already in the user's cart
                connection.query(
                    'SELECT * FROM user_cart WHERE course_id = ? AND user_id = ?',
                    [id, user.id],
                    (err, cartRows) => {
                        if (err) {
                            console.error('Error checking cart:', err);
                            res.status(500).json({ error: "Internal Server Error" });
                            return;
                        }

                        if (cartRows.length > 0) {
                            res.status(400).json({ error: "Course already in cart" });
                            return;
                        }

                        // If the course is not in the cart and is activated, insert it
                        if (user.p_type === "Student") {
                            connection.query(
                                'INSERT INTO user_cart (course_id , user_id , status) VALUES (?, ?, ?)',
                                [id, user.id, 'Pending'],
                                (err, results) => {
                                    if (err) {
                                        console.error('Error inserting data into MySQL:', err);
                                        res.status(500).json({ error: "Internal Server Error" });
                                        return;
                                    }
                                    res.status(201).json({
                                        message: "Course added to cart",
                                        insertedId: results.insertId
                                    });
                                }
                            );
                        } else {
                            res.status(403).json({ error: "You cannot buy the course" });
                        }
                    }
                );
            }
        );
    } catch (error) {
       
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getusercartitem = async (req, res) => {
    try {
        const user = req.user;

        if (user.p_type === "Student") {
            connection.query(
                'SELECT user_cart.cart_id, user_cart.course_id, user_cart.status,courses.c_name, courses.c_details, courses.price, courses.image FROM user_cart JOIN courses ON user_cart.course_id = courses.id WHERE user_cart.user_id = ?',
                user.id,
                (err, rows) => {
                    if (err) {
                        console.error('Error fetching cart items:', err);
                        res.status(500).json({ error: "Internal Server Error" });
                        return;
                    }
                   
                    // Fetch total cart items count
                    connection.query(
                        'SELECT COUNT(*) AS total_items FROM user_cart WHERE user_id = ?',
                        [user.id],
                        (err, result) => {
                            if (err) {
                                console.error('Error fetching total cart items:', err);
                                res.status(500).json({ error: "Internal Server Error" });
                                return;
                            }

                            const totalCartItems = result[0].total_items;
                            
                            // Send the cart items with course details and total items count as JSON response
                           res.json({ cartItems: rows, totalItems: totalCartItems });
                        }
                    );
                }
            );
        } else {
            res.status(403).json({ error: "You don't have access to this information" });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addcousematerial = async (req, res) => {
    try {
        const validationRules = [
            check('course_id').notEmpty().withMessage('Course ID is required').isInt().withMessage('Course ID must be an integer'),
            check('material_name').notEmpty().withMessage('Material name is required'),
            check('material_type').notEmpty().withMessage('Material type is required').isIn(['Video', 'PDF', 'Document']).withMessage('Invalid material type'),
            check('material_url').notEmpty().withMessage('Material URL is required').isURL().withMessage('Invalid URL format'),
            check('description').notEmpty().withMessage('Material Description is required'),
        ];

        await Promise.all(validationRules.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract fields from req.body
        const { course_id, material_name, material_type ,material_url ,description } = req.body;
        // Get the uploaded filename and file path
        

        // Create CourseMaterial instance using Sequelize model
        const newCourseMaterial = await CourseMaterial.create({
            course_id,
            material_name,
            material_type,
            material: material_url,
            description,
            uploaded_by: req.user.id, // Assuming you have user information in req.user
            upload_date: new Date() // Set current date as upload date
        });

        res.status(200).json({
            msg: `Course Material added successfully with material name ${newCourseMaterial.material_name}`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getUserCourseMaterials = async (req, res) => {
    try {
        const user = req.user;
  const userId = user.id;
        // Fetch course materials where uploaded_by is equal to userId
        const userCourseMaterials = await CourseMaterial.findAll({
            where: { uploaded_by: userId },
           
            order: [['material_name', 'DESC']] // Order by upload_date in descending order
        });

        res.status(200).json({ userCourseMaterials });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch user course materials' });
    }
};
const delete_material = async (req, res) => {
    try {
      const { id } = req.params;
  
      const courseMaterial = await CourseMaterial.findByPk(id);
      if (!courseMaterial) {
        return res.status(404).json({ error: 'Course material not found' });
      }
  
      await CourseMaterial.destroy({
        where: { material_id: id }
      });
  
      res.status(200).json({ message: 'Course Material deleted successfully' });
    } catch (error) {
      console.error('Failed to delete course material:', error);
      res.status(500).json({ error: 'Failed to delete course material' });
    }
  };
  const make_payment = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        if (user.p_type === "Student") {
            // Fetch cart items from user's cart
            connection.query(
                'SELECT user_cart.cart_id, user_cart.course_id, user_cart.status,courses.c_name, courses.c_details, courses.price, courses.image FROM user_cart JOIN courses ON user_cart.course_id = courses.id WHERE user_cart.user_id = ? AND user_cart.cart_id = ?',
                [user.id, id],
                (err, rows) => {
                    if (err) {
                        console.error('Error fetching cart items:', err);
                        res.status(500).json({ error: "Internal Server Error" });
                        return;
                    }

                    // Insert cart items into orders table
                    connection.query(
                        'INSERT INTO orders (order_id, user_id, course_id, status) VALUES ?',
                        [rows.map(row => [row.cart_id, user.id, row.course_id, "completed"])],
                        (err, result) => {
                            if (err) {
                                console.error('Error inserting cart items into orders:', err);
                                res.status(500).json({ error: "Internal Server Error" });
                                return;
                            }

                            // Fetch total cart items count
                            connection.query(
                                'SELECT COUNT(*) AS total_items FROM orders WHERE user_id = ?',
                                [user.id],
                                (err, result) => {
                                    if (err) {
                                        console.error('Error fetching total cart items:', err);
                                        res.status(500).json({ error: "Internal Server Error" });
                                        return;
                                    }

                                    const totalItems = result[0].total_items;

                                    // Send the cart items with course details and total items count as JSON response
                                    res.json({  totalItems: totalItems, message: 'order places successfully' });
                                }
                            );
                        }
                    );
                }
            );
        } else {
            res.status(403).json({ error: "You don't have access to this information" });
        }
    } catch (error) {
        console.error('Failed to make payment:', error);
        res.status(500).json({ error: 'Failed to make payment' });
    }
}

module.exports={
    addtocart,
    getusercartitem,
    addcousematerial,
    getUserCourseMaterials,
    delete_material,
    make_payment
}