const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', [
    check('name', 'Please add name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        //find user by email
        let user = await User.findOne({ email });

        if(user) {
            //send a bad response if user already exist
            return res.status(400).json({ msg: 'User already exists' });
        }

        //use the User model to create a new User
        //creating a new instance of a User
        user = new User({
            name,
            email,
            password
        })

        //encrypt password before storing it into database
        //using bcrypt to encrypt password
        //salt = need salt to encrypt password
        const salt = await bcrypt.genSalt(10);

        //take the user.password and hashed it
        //bcrypt.hash(plain-text-password, salt-generated)
        user.password = await bcrypt.hash(password, salt);

        //save the user into db
        await user.save();

        //create payload to be send into token
        const payload = {
            user: {
                id: user.id
            }
        }

        //to generate token, use jwt.sign(payload, secret, object-of-options, callbackfunction(err, token) => {})
        //expiresIn: 3600sec = 1hr
        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            res.json({ token });
        })
        
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

module.exports = router;