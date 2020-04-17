const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User')

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    //to use auth middleware, just pass it in as a second parameter
    try {
        //get user from db
        //return the whole user object including password
        //to omit password, use .select('-password')
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth
// @desc    Auth user and get token
// @access  Public
router.post('/', [
    check('email', 'Please enter valid email address').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        //check email
        //findOne returns a promise which allows for async await
        let user = await User.findOne({ email })
        if(!user) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        }

        //check password
        //use bcrypt.compare
        //bcyrpt.compare returns a promise
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        }

        //if match both email and password
        //create payload and generate token
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload,config.get('jwtSecret'),{
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            res.json({ token });
        })

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error')
    }

});

module.exports = router;