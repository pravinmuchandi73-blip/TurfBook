const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");


// ==========================================
// CREATE BOOKING
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            userId,
            turfId,
            date,
            timeSlot
        } = req.body;


        if (
            !userId ||
            !turfId ||
            !date ||
            !timeSlot
        ) {

            return res.status(400).json({

                message:
                    "All booking details are required"

            });

        }


        // Check whether the slot is already booked

        const existingBooking =
            await Booking.findOne({

                turfId:
                    turfId,

                date:
                    date,

                timeSlot:
                    timeSlot,

                status:
                    "Confirmed"

            });


        if (existingBooking) {

            return res.status(400).json({

                message:
                    "This time slot is already booked"

            });

        }


        const booking =
            new Booking({

                userId:
                    userId,

                turfId:
                    turfId,

                date:
                    date,

                timeSlot:
                    timeSlot,

                status:
                    "Confirmed"

            });


        await booking.save();


        res.status(201).json({

            message:
                "Turf booked successfully!",

            booking:
                booking

        });


    } catch (error) {

        console.error(
            "Booking Error:",
            error
        );


        res.status(500).json({

            message:
                "Booking failed",

            error:
                error.message

        });

    }

});



// ==========================================
// GET BOOKED TIME SLOTS
// ==========================================

router.get(
    "/slots/:turfId/:date",
    async (req, res) => {

        try {

            const {
                turfId,
                date
            } = req.params;


            const bookings =
                await Booking.find({

                    turfId:
                        turfId,

                    date:
                        date,

                    status:
                        "Confirmed"

                });


            const bookedSlots =
                bookings.map(
                    booking =>
                        booking.timeSlot
                );


            res.json({

                bookedSlots:
                    bookedSlots

            });


        } catch (error) {

            console.error(
                "Get Booked Slots Error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to check booked slots"

            });

        }

    }
);



// ==========================================
// GET USER BOOKINGS
// ==========================================

router.get(
    "/:userId",
    async (req, res) => {

        try {

            const bookings =
                await Booking.find({

                    userId:
                        req.params.userId

                }).sort({

                    createdAt:
                        -1

                });


            res.json(
                bookings
            );


        } catch (error) {

            console.error(
                "Get Bookings Error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load bookings",

                error:
                    error.message

            });

        }

    }
);



// ==========================================
// CANCEL USER BOOKING
// ==========================================

router.patch(
    "/:bookingId/cancel",
    async (req, res) => {

        try {

            const {
                bookingId
            } = req.params;

            const {
                userId
            } = req.body;


            if (!userId) {

                return res.status(400).json({

                    message:
                        "User ID is required"

                });

            }


            // Find booking

            const booking =
                await Booking.findById(
                    bookingId
                );


            if (!booking) {

                return res.status(404).json({

                    message:
                        "Booking not found"

                });

            }


            // Make sure the booking
            // belongs to this user

            if (
                booking.userId.toString() !==
                userId.toString()
            ) {

                return res.status(403).json({

                    message:
                        "You can only cancel your own booking"

                });

            }


            // Check status

            if (
                booking.status ===
                "Cancelled"
            ) {

                return res.status(400).json({

                    message:
                        "Booking is already cancelled"

                });

            }


            // Cancel booking

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
                "User Cancel Booking Error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to cancel booking",

                error:
                    error.message

            });

        }

    }
);



module.exports = router;