const passport = require('passport');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const connectDB = require('./database');
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
require('dotenv').config();

passport.use(new LocalStrategy (async (username, password, done) => {
    const db = await connectDB();
    const user = await db.collection('user').findOne({ username: username })
    if(!user) return done(null, false, { message: '아이디 없음' })
    
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid) return done(null, false, { message: '비번 불일치' })

    return done(null, user)
}))

// ✅ Google Strategy 추가
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    const db = await connectDB();
    const existingUser = await db.collection('user').findOne({ googleId: profile.id });

    if(existingUser) return done(null, existingUser);

    const newUser = {
        googleId: profile.id,
        username: profile.displayName,
        date: new Date()
    };
    await db.collection('user').insertOne(newUser);
    return done(null, newUser)
}))


passport.serializeUser((user, done) => {
    console.log('serializeUser:', user);
    done(null, { id: user._id.toString(), username: user.username })
})

passport.deserializeUser(async (user, done) => {
    const db = await connectDB();
    const result = await db.collection('user').findOne({ _id: new ObjectId(user.id) })
    delete result.password;
    result.id = result._id.toString(); // ✅ 추가: req.user.id에 사용됨!
    console.log('deserializeUser:', result);
    done(null, result)
})