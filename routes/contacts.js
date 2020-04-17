const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET api/contacts
// @desc    Get all users contacts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        //sort({ date: -1 }) = sort by most recent contact
        const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1 })
        res.json(contacts)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/contacts
// @desc    Add new contact
// @access  Private
router.post('/', [ auth, [
    check('name','Name is required').not().isEmpty()
] ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, phone, type } = req.body;

    try {
        //create new Contact
        const newContact = new Contact({
            name,
            email,
            phone,
            type,
            user: req.user.id
        })

        const contact = await newContact.save();
        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// for DELETE and PUT, need describe which contact wants to be update/delete
// use placeholder, /:id, this checks the id of the contact so it knows what to update/delete
// @route   PUT api/contacts/:id 
// @desc    Update contact
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, email, phone, type } = req.body;

    //build a contact
    const contactFields = {};
    if(name) contactFields.name = name;
    if(email) contactFields.email = email;
    if(phone) contactFields.phone = phone;
    if(type) contactFields.type = type;

    try {
        let contact = await Contact.findById(req.params.id);

        //404 - request not found
        if(!contact){
            return res.status(404).json({ msg: 'Contact not found' });
        }

        //make user owns contact
        //compare this with user from token
        //401 - unauthorized
        if(contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' })
        }

        //findByIdAndUpdate - to update the contact
        contact = await Contact.findByIdAndUpdate(req.params.id,
            { $set: contactFields },
            { new: true }
        );

        res.json(contact);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/contacts/:id 
// @desc    Delete contact
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let contact = await Contact.findById(req.params.id);

        //404 - request not found
        if(!contact){
            return res.status(404).json({ msg: 'Contact not found' });
        }

        //make user owns contact
        //compare this with user from token
        //401 - unauthorized
        if(contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' })
        }

        //delete
        await Contact.findByIdAndRemove(req.params.id)

        res.json({ msg: 'Contact removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;