const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const { body, validationResult } = require('express-validator');

const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const jwtSecret = "Thisismyfirstmernstackproject@#"
router.post("/createuser",
    [body('email').isEmail(),
    body('name').isLength({ min: 5 }),
    body('password').isLength({ min: 5 })],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "An account with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(req.body.password,salt)
            try {
                await User.create({
                    name: req.body.name,
                    password: secPassword,
                    email: req.body.email,
                    location: req.body.location
                })
                res.json({ success: true })
            } catch (error) {
                console.log(error)
                res.json({ success: false });
            }
        })


router.post("/loginuser",
    [body('email').isEmail(),
    body('password').isLength({ min: 5 })],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let email = req.body.email;
        try {
            const adminData = await Admin.findOne({ email });
            if (adminData && adminData.isActive) {
                const pwdcompare = await adminData.comparePassword(req.body.password);
                if (pwdcompare) {
                    const data = { user: { id: adminData.id, role: 'admin' } };
                    const authToken = jwt.sign(data, jwtSecret);
                    return res.json({ success: true, authToken, role: 'admin', admin: { id: adminData.id, name: adminData.name, email: adminData.email } });
                }
            }

            let userData = await User.findOne({ email });
            if (!userData) {
                return res.status(400).json({ errors: "Try logging with correct credentials" })
            }

            if (userData.isBlocked) {
                return res.status(403).json({ errors: "Your account has been blocked. Please contact support." })
            }

            const pwdcompare= await bcrypt.compare(req.body.password,userData.password)
            if (!pwdcompare) {
                return res.status(400).json({ errors: "Try logging with correct credentials" })
            }

            const data={
                user:{
                    id:userData.id
                }
            }

            const authToken=jwt.sign(data,jwtSecret)
            return res.json({ success: true ,authToken:authToken, role: 'user'})
        } catch (error) {
            console.log(error)
            res.json({ success: false });
        }
    })

router.post("/forgot-password", [
    body('email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    try {
        const { email, newPassword } = req.body;

        if (!newPassword) {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: 'No account found with this email' });
            }
            return res.json({ success: true, message: 'Email verified' });
        }

        if (newPassword.length < 5) {
            return res.status(400).json({ success: false, message: 'Password must be at least 5 characters' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})

router.post("/verify-user", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, exists: false, message: 'This account no longer exists. It has been permanently deleted.' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ success: false, exists: true, blocked: true, message: 'Your account has been blocked. Please contact support.' });
        }
        res.json({ success: true, exists: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
})

module.exports = router;