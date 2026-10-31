const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        turfId: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        timeSlot: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: "Confirmed"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema);