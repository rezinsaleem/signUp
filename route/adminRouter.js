const express = require("express");
const collection = require('../models/config');
const bcrypt = require('bcrypt');
const adminRouter = express.Router();

adminRouter.get("/", (req, res) => {

    if (req.session.isAdAuth) {
        res.redirect('admin/dashboard')
        return;
    }

    const errorMessages = req.flash('error');

    res.render('admin/adminLogin', { errorMessages });
})

adminRouter.post("/adminlogin", async (req, res) => {
    try {
        const admin = await collection.findOne({ email: req.body.email });

        if (!admin) {
            req.flash('error', 'Admin not found');
            return res.redirect('/admin');
        }

        const isPassMatch = await bcrypt.compare(req.body.password, admin.password);

        if (!isPassMatch) {
            req.flash('error', 'Wrong password');
            return res.redirect('/admin');
        }

        if (admin.is_admin === true) {
            req.session.admin = req.body.email;
            req.session.isAdAuth = true;
            return res.redirect('/admin/dashboard');
        } else {
            req.flash('error', 'You are not an Admin');
            return res.redirect('/admin');
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        req.flash('error', 'An unexpected error occurred');
        return res.redirect('/admin');
    }
});

adminRouter.get('/dashboard', async (req, res) => {
    if (req.session.isAdAuth) {
        const successMessages = req.flash('success');
        const deleteMessage = req.flash('delete');

        try {
            if (req.session.admin) {
                const users = await collection.find().exec();
                res.render('admin/dashboard', { successMessages, deleteMessage, users });
            } else {
                res.redirect('/admin');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin')
    }
});

adminRouter.get('/dashboard/createUser', (req, res) => {
    if (req.session.isAdAuth) {
        const errorMessages = req.flash('error');
        res.render('admin/createUser', { errorMessages })
    } else {
        res.redirect('/admin')
    }
})

//inserting user created by admin
adminRouter.post('/createUser', async (req, res) => {

    if (req.session.isAdAuth) {
        try {
            // Validate input fields
            if (!req.body.username || !req.body.email || !req.body.password) {
                req.flash('error', 'All fields are required.');
                return res.redirect('/admin/dashboard/createUser');
            }

            const data = {
                name: req.body.username,
                email: req.body.email,
                password: req.body.password
            };

            const existingUser = await collection.findOne({ email: data.email });

            if (existingUser) {
                req.flash('error', 'User already exists. Please use a different email.');
                return res.redirect('/admin/dashboard/createUser');
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword;

            const result = await collection.insertMany(data);
            console.log(result);

            req.flash('success', 'User registered successfully!');
            return res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Error creating user:', error);
            req.flash('error', 'An unexpected error occurred while creating the user.');
            return res.redirect('/admin/dashboard/createUser');
        }
    } else {
        res.redirect('/admin')
    }
});


//edit an user route

adminRouter.get('/edit/:id', async (req, res) => {
    if (req.session.isAdAuth) {

        try {
            let id = req.params.id;
            const user = await collection.findOne({ _id: id }).exec();

            if (!user) {
                return res.redirect('/admin/dashboard');
            }

            res.render('admin/userEdit', {
                user: user
            });
        } catch (err) {
            console.error(err);
            res.redirect('/admin/dashboard');
        }
    } else {
        res.redirect('/admin')
    }
});

//update user route
adminRouter.post('/update/:id', async (req, res) => {
    if (req.session.isAdAuth) {
        try {
            let id = req.params.id;
            const updatedUser = await collection.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        name: req.body.name,
                        email: req.body.email,
                        is_admin: req.body.isAdmin,
                    },
                },
                { new: true }
            );

            if (updatedUser) {
                req.flash('success', 'User Updated Successfully!');
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/admin/dashboard');
            }

        } catch (err) {
            console.error(err);
            return res.redirect('/admin/dashboard');
        }
    } else {
        res.redirect('/admin')
    }

});

adminRouter.get('/delete/:id', async (req, res) => {
    if (req.session.isAdAuth) {
        try {
            let id = req.params.id;
            const deletedUser = await collection.findOneAndDelete({ _id: id });
            if (deletedUser) {
                req.flash('delete', 'User deleted successfully');
            }
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error("Error during user deletion:", error);
            res.redirect('/admin/dashboard');
        }
    } else {
        res.redirect('/admin')
    }
});

adminRouter.post('/searchUser', async (req, res) => {

    if (req.session.isAdAuth) {
        
        const successMessages = req.flash('success');
        const deleteMessage = req.flash('delete');
        try {
            const searchQuery = req.body.searchUser;

            const foundUsers = await collection.find({
                name: { $regex: new RegExp(searchQuery, "i") },
            });

            res.render('admin/dashboard', { users: foundUsers, successMessages, deleteMessage });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/admin')
    }
});

adminRouter.get('/logoutAdmin', (req, res) => {
        req.session.isAdAuth = false;
        res.redirect('/admin')
})

module.exports = adminRouter;


