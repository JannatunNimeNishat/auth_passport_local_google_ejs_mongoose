const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const app = express();

require('dotenv').config();

//step 13
//require the passport config 
require('./config/passport');

//db
require('./config/database');

//models
const Users = require('./models/user.model');

//
app.set("view engine", "ejs");

//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;



//session and passport -> step 1 
// npm i passport express-session
const passport = require('passport');
const session = require('express-session');

//coming from connect-mongo npm package // -> step 3
//npm i connect-mongo
const MongoStore = require('connect-mongo'); //used to store the sessions 


// coming from express-session -> step 2
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //   cookie: { secure: true }
    // coming from connect-mongo
    store: MongoStore.create({ // -> step 4
        mongoUrl: process.env.DB_URL, // our database url where we want to store our session data
        collectionName: "sessions", // our collection name where we want to store our created session
    })
}))

//initializing the passport -> step 5
app.use(passport.initialize()); // route e call hoyle passport ta jate initialized hoy 
app.use(passport.session()); // passport jate express-session ke use korte pare

// step 6 -> install i passport-local
// and create passport.js under config


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//base url
app.get('/', (req, res) => {
    res.render("index")
})


// register: get
app.get('/register', (req, res) => {
    res.render("register")
})

// register: post
app.post('/register', async (req, res) => {
    try {
        const user = await Users.findOne({ username: req.body.username });
        if (!user) {
            bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
                const newUser = new Users({
                    username: req.body.username,
                    password: hash,
                })
                await newUser.save();
                res.status(201).redirect("/login");
            });

        } else {
            res.status(400).send('user is already exists');
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
})

// step 14
// if user is already logged in  then directly go to the profile page
const checkLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        // we can get the data of loggedIn user
        const user = req.user;
        console.log('loggedIn',user);

        return res.redirect("/profile");
    }
    //if not loggedIn
    next();
}


//login : get
app.get('/login', checkLoggedIn, (req, res) => {
    
   // we can get the data of loggedIn user
     const user = req.user;
    console.log('loggedIn',user); 

    res.render("login");
})



// step 15 
//modify this login post route according to passport-local Strategies
//login : post
app.post('/login', passport.authenticate("local",
    {
        failureRedirect: '/login', //if login is unsuccessful redirect to login page
        successRedirect: '/profile', //if login is successful redirect to profile page 
    }),
    /* (req, res) => {
        const user = req.user;
        console.log('loggedIn',user);
    } */
);



// protected route
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}


// step 17
//protected route
// profile  protected -> if user is login then he access this profile route
app.get('/profile', checkAuthenticated, (req, res) => {

    // 
    console.log('profile');
    res.render("profile");

    /*  if (req.isAuthenticated()) { // builtin passport.js checking user is authenticate orr not
 
         res.render("profile");
     } 
     res.redirect('/login');*/


})


// step 16
//logout : post
app.get('/logout', (req, res) => {

    try {
        req.logOut((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        })
    } catch (error) {
        res.status(500).send(error.message);
    }

})




module.exports = app;