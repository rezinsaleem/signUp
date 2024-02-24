const express = require('express')
const userRouter = express.Router()
const bcrypt = require("bcrypt")
const collection = require("../models/config")


userRouter.get("/", (req, res) => {
    if (req.session.isAuth) {
        res.redirect('/home');
        return;
    }else{
        const errorMessages = req.flash('error');
    const successMessage = req.flash('success');

    res.render('user/login', { errorMessages, successMessage });
    }
});

userRouter.get('/home', (req, res) => {
    if (req.session.isAuth) {
        res.render('user/home', { user: req.session.user })
    } else {
        res.redirect('/')
    }
})

userRouter.get("/signup", (req, res) => {
    const errorMessages = req.flash('error');
    const successMessage = req.flash('success');

    if (!req.session.isAuth) {
        res.render("user/signup", { errorMessages, successMessage });
    } else {
        res.redirect('/');
    }
});

userRouter.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    };

    const existingUser = await collection.findOne({ email: data.email });

    if (existingUser) {
        req.flash('error', 'User already exists. Please choose a different username.');
        res.redirect('/signup');
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;


        const result = await collection.insertMany(data);
        console.log(result);

        req.flash('success', 'User registered successfully!');
        res.redirect('/');
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });

        if (!check) {
            req.flash('error', 'User not found.');
            return res.redirect('/');
        }

        const isPassMatch = await bcrypt.compare(req.body.password, check.password);

        if (!isPassMatch) {
            req.flash('error', 'Wrong password.');
            return res.redirect('/');
        }

        req.session.user = req.body.email;
        req.session.isAuth = true;
        res.redirect("/home");

    } catch (error) {
        console.error("Error during login:", error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/');
    }
});

userRouter.get('/logout', (req, res) => {
    req.session.isAuth = false;
        res.redirect('/');
});

module.exports = userRouter;

