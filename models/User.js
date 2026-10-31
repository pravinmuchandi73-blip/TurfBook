const mongoose = require("mongoose");


// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(

    {
        // ==============================
        // NAME
        // ==============================

        name: {
            type: String,
            required: true,
            trim: true
        },


        // ==============================
        // EMAIL
        // ==============================

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },


        // ==============================
        // PASSWORD
        // ==============================

        password: {
            type: String,
            required: true
        },


        // ==============================
        // ROLE
        // ==============================

        role: {
            type: String,

            enum: [
                "user",
                "admin"
            ],

            default: "user"
        }

    },


    // ==============================
    // TIMESTAMPS
    // ==============================

    {
        timestamps: true
    }

);


// ==========================================
// EXPORT MODEL
// ==========================================

module.exports =
    mongoose.model(
        "User",
        userSchema
    );