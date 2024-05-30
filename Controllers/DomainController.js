
const Domain =require('../Models/Domain')
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const add_domain = async (req, res) => {



  try {
    const validationRules = [
      check('name').notEmpty().withMessage('Name is required'),
      check('heading').notEmpty().withMessage('Heading is required'),
      check('description').notEmpty().withMessage('Description is required'),
      // check('duration').notEmpty().withMessage('Duration is required'),
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
    const newCourse = await Domain.create({ name, heading, description, duration, image: filePath });
    res.status(200).json({
      msg: "Domain added successfully"
    });
  } catch (error) {
    res.status(500).json({
      errormsg: 'Failed to create domain'
    });
  }
};





const upload_image=(req,res)=>{
  const { filename } = req.file;
  res.status(500).json({
    errormsg: filename
  });
}

const get_domains = async (req, res) => {
    try {
        // Fetch all domain from the database using Sequelize
        const domain = await Domain.findAll({
          order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
        });

        // Send the retrieved domains as JSON response
        res.status(200).json({ domains:domain });
      } catch (error) {
        console.error('Failed to fetch domains:', error);
        res.status(500).json({ error: 'Failed to fetch domains' });
      }
}
// get course where status =1
const get_activated_domains = async (req, res) => {
  try {
    // Fetch all courses from the database using Sequelize
    const domains = await Domain.findAll({
      where: { status: 1 },
      order: [['name', 'ASC']], // Order by the 'createdAt' column in descending order
    });

    // Send the retrieved domains as JSON response
    res.status(200).json({ domains });
  } catch (error) {
    console.error('Failed to fetch domain:', error);
    res.status(500).json({ error: 'Failed to fetch domain' });
  }
}
const update_domain_status = async (req, res) => {
    try {
      const { id } = req.params; 

     
      const domain = await Domain.findByPk(id);

      if (!domain) {
        return res.status(404).json({ error: 'Domain not found' });
      }

      // Toggle the status between 0 and 1
      const newStatus = domain.status === 0 ? 1 : 0;

  
      const updateddomain = await Domain.update(
        { status: newStatus },
        { where: { id } }
      );

      if (updateddomain > 0) {
        res.status(200).json({ message: 'domain status updated successfully', domainName: domain.name });
      } else {
        res.status(404).json({ error: 'No domain found or status not updated' });
      }
    } catch (error) {
      console.error('Failed to update domain status:', error);
      res.status(500).json({ error: 'Failed to update domain status' });
    }
  };
  const delete_domain = async (req, res) => {
    try {
      const { id } = req.params;
  
      const domain = await Domain.findByPk(id);
      if (!domain) {
        return res.status(404).json({ error: 'Domain not found' });
      }
  
      // Delete the image file from the uploads folder
      const imagePath = domain.image; // Assuming image path is stored in domain.image
      if (imagePath) {
        fs.unlinkSync(imagePath); // Synchronously delete the file
      }
  
      await Domain.destroy({
        where: { id }
      });
  
      res.status(200).json({ message: 'Domain deleted successfully' });
    } catch (error) {
      console.error('Failed to delete domain:', error);
      res.status(500).json({ error: 'Failed to delete domain' });
    }
  };
  
  const delete_selected_domains = async (req, res) => {
    try {
      const { ids } = req.body;
  
      const existingDomains = await Domain.findAll({ where: { id: ids } });
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
  
      await Domain.destroy({
        where: { id: ids }
      });
  
      res.status(200).json({ message: 'Selected domains deleted successfully' });
    } catch (error) {
      console.error('Failed to delete selected domains:', error);
      res.status(500).json({ error: 'Failed to delete selected domains' });
    }
  };
  
module.exports={
    add_domain,
    get_domains,
    update_domain_status,
    delete_domain,
    delete_selected_domains,
  get_activated_domains,
  upload_image
}