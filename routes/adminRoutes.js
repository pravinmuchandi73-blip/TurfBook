const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Booking = require("../models/Booking");

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");


// ==========================================
// ADMIN SECURITY
// ==========================================

router.use(
    authMiddleware,
    adminMiddleware
);


// ==========================================
// GET ALL USERS
// ==========================================

router.get("/users", async (req, res) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1
            });

        res.json({
            users: users
        });

    } catch (error) {

        console.error(
            "Admin Users Error:",
            error
        );

        res.status(500).json({
            message: "Unable to load users"
        });

    }

});


// ==========================================
// GET ALL BOOKINGS
// ==========================================

router.get("/bookings", async (req, res) => {

    try {

        const bookings = await Booking.find()
            .sort({
                createdAt: -1
            });


        // Add customer information
        const bookingDetails =
            await Promise.all(

                bookings.map(
                    async (booking) => {

                        const user =
                            await User.findById(
                                booking.userId
                            ).select(
                                "name email"
                            );


                        return {

                            _id:
                                booking._id,

                            turfId:
                                booking.turfId,

                            turfName:
                                getTurfName(
                                    booking.turfId
                                ),

                            userId:
                                booking.userId,

                            customerName:
                                user
                                    ? user.name
                                    : "Unknown User",

                            customerEmail:
                                user
                                    ? user.email
                                    : "Unknown Email",

                            date:
                                booking.date,

                            timeSlot:
                                booking.timeSlot,

                            status:
                                booking.status,

                            createdAt:
                                booking.createdAt

                        };

                    }
                )

            );


        res.json({

            bookings:
                bookingDetails

        });


    } catch (error) {

        console.error(
            "Admin Bookings Error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load bookings"

        });

    }

});


// ==========================================
// TURF NAME FUNCTION
// ==========================================

function getTurfName(turfId) {

    const turfs = {

        "1":
            "City Sports Turf",

        "2":
            "Green Play Turf",

        "3":
            "Champions Turf"

    };


    return (
        turfs[turfId] ||
        `Turf ${turfId}`
    );

}


// ==========================================
// DASHBOARD SUMMARY
// ==========================================

router.get(
    "/dashboard",
    async (req, res) => {

        try {

            const totalUsers =
                await User.countDocuments();


            const totalBookings =
                await Booking.countDocuments();


            const confirmedBookings =
                await Booking.countDocuments({
                    status: "Confirmed"
                });


            res.json({

                totalUsers:
                    totalUsers,

                totalBookings:
                    totalBookings,

                confirmedBookings:
                    confirmedBookings

            });


        } catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to load dashboard"

            });

        }

    }
);
// ==========================================
// CANCEL BOOKING
// ==========================================

router.patch(
    "/bookings/:id/cancel",
    async (req, res) => {

        try {

            const booking =
                await Booking.findById(
                    req.params.id
                );

            if (!booking) {

                return res.status(404).json({
                    message:
                        "Booking not found"
                });

            }

            if (
                booking.status ===
                "Cancelled"
            ) {

                return res.status(400).json({
                    message:
                        "Booking is already cancelled"
                });

            }

            booking.status =
                "Cancelled";

            await booking.save();

            res.json({

                message:
                    "Booking cancelled successfully",

                booking:
                    booking

            });

        } catch (error) {

            console.error(
                "Cancel Booking Error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to cancel booking"

            });

        }

    }
);

module.exports = router;