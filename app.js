const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();

// Passport config
require('./config/passport')(passport);

// Mongo Config
const db = require('./config/keys').MongoURL;

// Connect to database
mongoose.connect(db, { useNewUrlParser: true }).then(() => console.log("Mongo connected")).catch(e => console.log(e))

// EJS Layout
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global variables
app.use((request, response, next) => {
    response.locals.success_msg = request.flash('success_msg');
    response.locals.error_msg = request.flash('error_msg');
    response.locals.error = request.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// set PORT as 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, console.log(`SERVER STARTED! PORT: ${PORT}`));