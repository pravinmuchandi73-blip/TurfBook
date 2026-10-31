const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Check required fields
        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        // Check existing user
        const existingUser =
            await User.findOne({
                email: email
            });


        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Create normal user
        const user = new User({

            name: name,

            email: email,

            password: hashedPassword,

            role: "user"

        });


        await user.save();


        res.status(201).json({

            message:
                "Registration successful"

        });


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        res.status(500).json({

            message:
                "Registration failed",

            error:
                error.message

        });

    }

});



// ==========================================
// NORMAL USER LOGIN
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Find user
        const user =
            await User.findOne({
                email: email
            });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // Check password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // Create JWT token
        const token =
            jwt.sign(

                {
                    id: user._id,
                    email: user.email,
                    role: user.role || "user"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }

            );


        res.json({

            message:
                "Login successful",

            token: token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role || "user"

            }

        });


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        res.status(500).json({

            message:
                "Login failed"

        });

    }

});



// ==========================================
// ADMIN LOGIN
// ==========================================

router.post(
    "/admin-login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            // Find admin
            const user =
                await User.findOne({
                    email: email
                });


            if (!user) {

                return res.status(401).json({

                    message:
                        "Invalid admin email or password"

                });

            }


            // Check admin role
            if (user.role !== "admin") {

                return res.status(403).json({

                    message:
                        "You are not authorized as an admin"

                });

            }


            // Check password
            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    message:
                        "Invalid admin email or password"

                });

            }


            // Create admin JWT
            const token =
                jwt.sign(

                    {
                        id: user._id,
                        email: user.email,
                        role: "admin"
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "1d"
                    }

                );


            // Send response
            res.json({

                message:
                    "Admin login successful",

                token: token,

                user: {

                    id: user._id,

                    name: user.name,

                    email: user.email,

                    role: "admin"

                }

            });


        } catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );


            res.status(500).json({

                message:
                    "Admin login failed"

            });

        }

    }
);



module.exports = router;