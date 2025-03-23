const express = require('express');
const router = express.Router();
const authCtrl = require('../controller/authController')
const passport = require('passport')

router.get('/login', authCtrl.loginPage);

router.post('/login', authCtrl.login);

router.get('/register', authCtrl.registerPage);

router.post('/register', authCtrl.register);

router.get('/logout', authCtrl.logout);

// 🟡 1. 구글 로그인 시작
router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));


// 🟡 2. 구글 콜백 처리
router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login?error=googleFail',
    }),
    (req, res) => {
        res.redirect('/');
    }
)


module.exports = router;