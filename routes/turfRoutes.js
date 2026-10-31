const express = require("express");
const router = express.Router();

const turfs = [
    {
        id: "1",
        name: "City Sports Turf",
        location: "Kolhapur",
        price: 500
    },
    {
        id: "2",
        name: "Green Play Turf",
        location: "Kolhapur",
        price: 600
    },
    {
        id: "3",
        name: "Champions Turf",
        location: "Kolhapur",
        price: 700
    }
];

router.get("/", (req, res) => {
    res.json(turfs);
});

module.exports = router;