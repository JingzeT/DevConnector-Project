const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const config = require('config')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const User = require('../../models/User')

// @route GET api/auth
// @desc Test route
// @access Public
router.get('/', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post('/', [ // contents should included in requests sent by users
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Password is required'
    ).exists()
],
async (req,res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        // See if user exists
        let user = await User.findOne({ email });

        if(!user){
            return res
            .status(400)
            .json({ errors: [{msg: 'Invalid Credentials'}]}); 
            // must be return... or an error happens: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res
            .status(400)
            .json({ errors: [{msg: 'Password is wrong'}]}); 
        }

        // Return jsonwebtoken
        //res.send('User registered');
        const payload = {
            user: {
                id: user.id
            },
            name: {
                name: user.name
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err;
                return res.json({ token });
                // if want to send it, delete the last response
            }
        );

    } catch(err) {
        console.log(err.message);
        return res.status(500).send('Server error');
        
    }

    
    //res.send('User route');
});

module.exports = router;