
const passport = require('passport');

const User = require('../models/user.model');

const bcrypt = require("bcrypt");

//step 8
const LocalStrategy = require("passport-local").Strategy;


// step 7  // this function will automatically call when we try to login  (middleware)
passport.use(new LocalStrategy(async (username, password, done) => {
    console.log('reached1');
    //step 9 -> customizing this function as par our need
    try {
        //getting our user by username
        const user = await User.findOne({ username: username });
        // user not found
        if (!user) {
            console.log('reached2 User not found');
            return done(null, false, { message: "User not found" });
        }
        //password verification -> matching the given password and already saved password
        //here we are using bcrypt as we are encrypt our password with this package 
        if (!bcrypt.compare(password, user.password)) {
            console.log('reached3 Invalid username or password');
            return done(null, false, { message: "Invalid username or password" });
        }

        //if all ok then send the user
        console.log('reached4 all ok user');
        return done(null, user);

    } catch (error) {
        console.log('reached5 error');
        return done(err);
    }

    /*     User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        }); */

}));


// step 10
// serializeUser 
//create session id
// whenever we login it creates user id inside session
passport.serializeUser((user, done) => {
    done(null, user.id);
});



// step 11
//find session info using session id
//we can find user saved info (serializeUser) using session id
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
})

// step 12
// Go to app.post('/login' and modify it according to Authenticate Requests() form passport.js -> passport-local

