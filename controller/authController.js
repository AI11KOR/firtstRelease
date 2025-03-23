const express = require('express');
const connectDB = require('../config/database');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { ObjectId } = require('mongodb')

exports.loginPage = (req, res) => {
    res.render('auth/login.ejs')
}

exports.login = (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if(error) return res.status(500).json(error);
        if(!user) return res.status(401).json(info.message);

        req.logIn(user, (err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    }) (req, res, next)
}

exports.registerPage = (req, res) => {
    res.render('auth/register.ejs')
}


exports.register = async (req, res) => {
    try {
        const db = await connectDB();
        const { username, password } = req.body;
        if(!username || !password) {
            res.status(401).json({message: '글자를 적어주세요'})
        }
        const existingUser = await db.collection('user').findOne({ username: username })
        if(existingUser) {
            res.status(403).json({ message: '이미 가입된 회원이 있습니다.'})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('user').insertOne({
            username, password: hashedPassword, date: new Date()
        })
        res.status(200).json({ redirect: '/login' })
    } catch (error) {
        console.log(error);
        res.status(500).json('error:', error);
    }
    
}

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) next(err);
        res.redirect('/login')
    })
}