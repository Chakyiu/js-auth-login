const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User schema
const User = require('../schema/User');

// verify
const sendMailAndGenToken = require('../config/verify').sendMailAndGenToken;
const verify = require('../config/verify').verify;

// Login
router.get('/login', (request, response) => {
    if (request.session.user && request.session.user.pass2StepAuth === true) {
        response.redirect('/users/logon')
    } else {
        response.render('login')
    }
});

// Register
router.get('/register', (request, response) => response.render('register'));

// Verify
let e = []

router.get('/verify', (request, response) => {
    if (request.session.user && request.session.user.pass2StepAuth === true) {
        response.redirect('/users/logon')
    } else if (request.session.user) {
        sendMailAndGenToken(request.session.user.email);
        response.render('verify', { e });
    } else {
        response.redirect('/users/login')
    }
});

// Register processing
router.post('/register', (request, response) => {
    const { name, email, password } = request.body;
    let e = [];

    // Checking requried fields
    if (!name || !email || !password) {
        e.push({ msg: 'Please fill in requried fields' });
    }

    // Checking password length
    if (password.length < 8) {
        e.push({ msg: 'Password must be at least 8 characters long' });
    }

    // If errors exist (missing fields || password length < 8)
    if (e.length > 0) {
        response.render('register', { e, name, email, password });
    } else {
        // Else valid input
        User.findOne({ email: email }).then(user => {
            if (user) {
                e.push({ msg: 'Email is already registered' })
                response.render('register', { e, name, email, password });
            } else {
                const newUser = new User({ name, email, password });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    // Hashed password
                    newUser.password = hash;
                    // Save user
                    newUser.save().then(user => {
                        request.flash('success_msg', 'Successfully registered');
                        response.redirect('/users/login');
                    })
                        .catch(err => console.log(err));
                }));
            }
        });
    }
})

// Login
router.post('/login', passport.authenticate('local', { session: false, failureRedirect: '/users/login', failureFlash: true }), (request, response, next) => {
    if (request.user) {
        request.session.user = {}
        request.session.user._id = request.user._id
        request.session.user.name = request.user.name
        request.session.user.email = request.user.email
        request.session.user.pass2StepAuth = request.user.false
        response.redirect('/users/verify')
    }
});

// Verify
router.post('/verify', (request, response, next) => {
    const { token } = request.body;
    const { name, email } = request.session.user
    let e = [];
    if (verify(email, token)) {
        request.session.user.pass2StepAuth = true
        response.redirect('/users/logon')
    } else {
        e.push({ msg: 'Error Code!' })
        response.render('verify', { e, name, email });
    }
});

// Logout
router.get('/logout', (request, response) => {
    request.session.user = null;
    request.logout();

    request.flash('success_msg', 'Successfully logged out');
    response.redirect('/users/login');
});


router.get('/logon', (request, response) => {
    if (request.session.user && request.session.user.pass2StepAuth === true) {
        response.render('logon', { name: request.session.user.name })
    } else {
        response.redirect('/users/login')
    }
});


module.exports = router;