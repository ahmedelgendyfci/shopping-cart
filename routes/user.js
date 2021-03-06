const express = require('express');
const router = express.Router();
const csrf = require('csurf')
const passport = require('passport')

const Order = require('../models/order')
const Cart = require('../models/cart')

const csrfProtection = csrf();
router.use(csrfProtection);


router.get('/profile', isLoggedIn, async (req, res) => {
    Order.find({user:req.user},function (err,orders) {
        if (err){
            return res.write("Error!")
        }
        // console.log(orders[0].cart)
        let cart ;
        orders.forEach(function (order){
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
            // console.log(order.items)
        })
        // console.log(orders)
        res.render('user/profile',{orders: orders});
    }).lean()
})

// sign up
router.get('/signup', async (req, res) => {
    const messages = req.flash('error');
    res.render('user/signup', {
        csrfToken: req.csrfToken,
        messages: messages,
        hasErrors: messages.length
    });
})
router.post('/signup', passport.authenticate('local.signup', {
        failureRedirect: '/user/signup',
        failureFlash: true
    }), function (req, res, next) {
        if (req.session.urlOld) {
            let urlOld = req.session.urlOld;
            req.session.urlOld = null;
            res.redirect(urlOld)
        } else {
            res.redirect('/user/profile')
        }

    }
);
// sign in
router.get('/signin', notLoggedIn, async (req, res) => {
    const messages = req.flash('error');
    res.render('user/signin', {
        csrfToken: req.csrfToken,
        messages: messages,
        hasErrors: messages.length
    });
})
router.post('/signin', passport.authenticate('local.signin', {
        failureRedirect: '/user/signin',
        failureFlash: true
    }), function (req, res, next) {
        if (req.session.urlOld) {
            let urlOld = req.session.urlOld;
            req.session.urlOld = null;
            res.redirect(urlOld)
        } else {
            res.redirect('/user/profile')
        }

    }
);
//log out
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
})

// sending the APIs
module.exports = router;


// authentication middleware functions
// and the user roles ==> look the comments below
function isLoggedIn(req, res, next) {
    // const buyerUrls = ['/profile', '/shopping-cart']
    // console.log(req.url)
    if (req.isAuthenticated()) {
        // console.log(buyerUrls.includes(req.url))
        // if(req.user.role === 'buyer' && buyerUrls.includes(req.url)){
        //     return res.send('Accessing this page not allowed!')
        // }
        next();
    } else {
        res.redirect("/user/signin");
    }
}

function notLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        next()
    }
}


