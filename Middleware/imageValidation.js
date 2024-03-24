const { check, validationResult } = require('express-validator');

const imageValidation = [
    check('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Image file is required');
        }
        // You can add additional checks for file type, size, etc. here if needed
        return true;
    }),
];

module.exports = imageValidation;
