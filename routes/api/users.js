const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')

const User = require('../../models/User');

// @route POST api/users
// @desc Register user
// @access Public
router.post('/', [ // contents should included in requests sent by users
    check('name', 'Name is required') // if name is empty, send message that behind the ','
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Please enter a password with 6 or more characters'
    ).isLength({ min: 6})
],
async (req,res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {

        // See if user exists
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({ errors: [{msg: 'User already exists'}]}); 
            // must be return... or an error happens: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
        }

        // Get users gravatar
        //https://www.npmjs.com/package/gravatar-url
        const avatar = gravatar.url(email, {
            s: '200', //size
            r: 'pg', //rating
            d: 'mm' //default image
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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
                return res.status(200).json({ token });
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