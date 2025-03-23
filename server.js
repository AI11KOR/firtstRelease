const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 8000;
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('./config/passport')
require('dotenv').config();

const authRouter = require('./routes/authRouter')
const postRouter = require('./routes/postRouter')

app.use(session({
    secret: process.env.MONGO_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        dbName: 'forum'
    }),
    logger: console
}))

app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './public')));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
})

app.use('/', authRouter)
app.use('/', postRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})