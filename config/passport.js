const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize');

// Load User model
const User = require('../schema/User');

// log controller
const logging = require('./logging');
const setting = require('./settings');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            // sanitize input that include '$'
            clean = sanitize(email);
            User.findOne({
                email: clean
            })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }

                    // Incorrect password attempts
                    var target = logging.getUserLoginLog(email);
                    if (target !== -1) {
                        if (Date.now() - target.date <= setting.login_gap_in_sencond * 1000 && target.time >= setting.login_times) {
                            return done(null, false, { message: 'Wrong password many times, Locked' });
                        }
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {

                            // Clean incorrect password attempts
                            var data = { "email": email, "date": Date.now() };
                            logging.updateLoginLog(data, 0);

                            return done(null, user);
                        } else {
                            // Incorrect password attempts
                            var data = { "email": email, "date": Date.now() };
                            logging.updateLoginLog(data);

                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                });
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};