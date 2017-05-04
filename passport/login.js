var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
var bCrypt = require('bcrypt-nodejs');

module.exports = function (passport) {

    passport.use('login', new LocalStrategy({

            passReqToCallback: true
        },
        function (req, email, password, done) {
            // check in mongo if a user with username exists or not
            User.findOne({
                    'email': email
                },
                function (err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);

                    // Username does not exist, log the error and redirect back
                    if (!user) {
                        console.log('User Not Found with username ' + email);
                        return done(null, false, req.flash('message', 'User Not found.'));
                    }
                    // User found but account is locked
                    else if (user && user.lock_until > Date.now()) {
                        console.log('account still locked!');
                        return done(null, false, req.flash('message', 'Your account is locked due to too many failed login attempts'));
                    }

                    // User exists and is not locked but wrong password, log the error 
                    if (!isValidPassword(user, password)) {
                        console.log('Invalid Password');

                        user.login_attempts += 1;

                        incLoginAttempts(user);

                        if (user.login_attempts == 5) {
                            console.log('account locked!');
                            return done(null, false, req.flash('message', 'Your account has been locked due to too many failed login attempts'));
                        }


                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    // reset login attempts count
                    resetLoginAttempts(user);
                    return done(null, user);
                }
            );

        }));


    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    }

    var incLoginAttempts = function (user) {

        console.log("incrementing failed logins")

        //reset if account unloced but still incorrect login
        if (user.lock_until != 1 && user.lock_until < Date.now()) {
            user.login_attempts = 1
            user.lock_until = 1

        }

        if (user.login_attempts == 5) {
            user.lock_until = Date.now() + (1000 * 60 * 10);
        }

        user.save(function (err, user) {

            console.log("failed attempts saved");

            if (err)
                console.log("Error saving failed login attempt: " + err);
        });
    }

    var resetLoginAttempts = function (user) {


        user.lock_until = 1;
        user.login_attempts = 0;

        user.save(function (err, user) {

            console.log("reset login attempts");

            if (err)
                console.log("Error resetting login attempts: " + err);
        });
    };

}