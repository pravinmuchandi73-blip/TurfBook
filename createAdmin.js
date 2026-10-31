const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");

        const email = "admin@turfbook.com";
        const password = "Admin@12345";

        const hashedPassword =
            await bcrypt.hash(password, 10);

        let admin =
            await User.findOne({ email });

        if (admin) {

            admin.name = "TurfBook Admin";
            admin.password = hashedPassword;
            admin.role = "admin";

            await admin.save();

            console.log("Admin account updated successfully.");

        } else {

            admin = new User({
                name: "TurfBook Admin",
                email: email,
                password: hashedPassword,
                role: "admin"
            });

            await admin.save();

            console.log("Admin account created successfully.");
        }

        console.log("--------------------------------");
        console.log("ADMIN ACCOUNT READY");
        console.log("Email:", email);
        console.log("Role: admin");
        console.log("--------------------------------");

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "Error creating admin:",
            error.message
        );

        await mongoose.disconnect();
    }
}

createAdmin();