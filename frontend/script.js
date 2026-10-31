// ============================================
// TURFBOOK - FRONTEND SCRIPT
// ============================================

const API_URL = "http://10.204.132.243:5000/api";

// ============================================
// LOCAL STORAGE
// ============================================

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        return null;
    }
}

function getToken() {
    return localStorage.getItem("token");
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    updateUserUI();
    loadTurfs();
    loadBookings();

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const viewTurfsBtn = document.getElementById("viewTurfsBtn");

    if (viewTurfsBtn) {
        viewTurfsBtn.addEventListener("click", () => {
            loadTurfs();

            const turfsSection = document.getElementById("turfs");

            if (turfsSection) {
                turfsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }
});

// ============================================
// UPDATE USER UI
// ============================================

function updateUserUI() {
    const user = getUser();

    const userName = document.getElementById("userName");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        if (userName) {
            userName.textContent = `Welcome, ${user.name}`;
        }

        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
        }
    } else {
        if (userName) {
            userName.textContent = "";
        }

        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }
    }
}

// ============================================
// REGISTER
// ============================================

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("registerName")?.value.trim();
    const email = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value;

    if (!name || !email || !password) {
        alert("Please fill all registration fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed.");
            return;
        }

        alert("Registration successful! Please login.");

        const registerForm = document.getElementById("registerForm");

        if (registerForm) {
            registerForm.reset();
        }

        const loginEmail = document.getElementById("loginEmail");

        if (loginEmail) {
            loginEmail.value = email;
        }

        const loginSection = document.getElementById("login");

        if (loginSection) {
            loginSection.scrollIntoView({
                behavior: "smooth"
            });
        }

    } catch (error) {
        console.error("Registration error:", error);
        alert("Unable to connect to the server.");
    }
}

// ============================================
// LOGIN
// ============================================

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed.");
            return;
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        updateUserUI();

        alert("Login successful!");

        const loginForm = document.getElementById("loginForm");

        if (loginForm) {
            loginForm.reset();
        }

        loadBookings();

        const myBookingsSection =
            document.getElementById("myBookingsSection");

        if (myBookingsSection) {
            myBookingsSection.scrollIntoView({
                behavior: "smooth"
            });
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to the server.");
    }
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    updateUserUI();

    const myBookings = document.getElementById("myBookings");

    if (myBookings) {
        myBookings.innerHTML = `
            <div class="empty-bookings">
                <h3>🔐 Please Login</h3>
                <p>Login to view your bookings.</p>
            </div>
        `;
    }

    alert("You have been logged out.");
}

// ============================================
// LOAD TURFS
// ============================================

async function loadTurfs() {
    const turfList = document.getElementById("turfList");

    if (!turfList) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/turfs`);

        if (!response.ok) {
            throw new Error("Failed to load turfs");
        }

        const turfs = await response.json();

        if (!turfs || turfs.length === 0) {
            turfList.innerHTML = `
                <div class="empty-bookings">
                    <h3>🏟️ No Turfs Available</h3>
                    <p>No turf is currently available.</p>
                </div>
            `;
            return;
        }

        turfList.innerHTML = turfs.map(turf => `
            <div class="turf-card">

                <div class="turf-card-content">

                    <h3>⚽ ${turf.name}</h3>

                    <p class="turf-location">
                        📍 ${turf.location}
                    </p>

                    <p class="turf-price">
                        ₹${turf.price} / hour
                    </p>

                    <button
                        class="book-btn"
                        onclick="bookTurf('${turf.id}', '${escapeAttribute(turf.name)}')">
                        📅 Book Now
                    </button>

                </div>

            </div>
        `).join("");

    } catch (error) {
        console.error("Error loading turfs:", error);

        turfList.innerHTML = `
            <div class="empty-bookings">
                <h3>⚠️ Unable to Load Turfs</h3>
                <p>Please make sure the backend server is running.</p>
            </div>
        `;
    }
}

// ============================================
// ESCAPE ATTRIBUTE
// ============================================

function escapeAttribute(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}

// ============================================
// BOOK TURF
// ============================================

async function bookTurf(turfId, turfName) {
    const user = getUser();

    if (!user) {
        alert("Please login first to book a turf.");
        return;
    }

    const token = getToken();

    if (!token) {
        alert("Please login first.");
        return;
    }

    showBookingModal(turfId, turfName);
}

// ============================================
// SHOW BOOKING MODAL
// ============================================

function showBookingModal(turfId, turfName) {

    const oldModal = document.getElementById("bookingModal");

    if (oldModal) {
        oldModal.remove();
    }

    const today = new Date().toISOString().split("T")[0];

    const modal = document.createElement("div");

    modal.id = "bookingModal";
    modal.className = "booking-modal";

    modal.innerHTML = `
        <div class="booking-modal-content">

            <button
                class="booking-close"
                onclick="closeBookingModal()">
                ×
            </button>

            <h2>⚽ Book ${turfName}</h2>

            <p class="booking-subtitle">
                Select your date and time slot
            </p>

            <label for="bookingDate">
                📅 Select Date
            </label>

            <input
                type="date"
                id="bookingDate"
                min="${today}"
                value="${today}"
            >

            <h3>🕐 Select Time Slot</h3>

            <div id="timeSlots" class="time-slots">

                <button
                    type="button"
                    class="time-slot"
                    data-time="6:00 PM - 7:00 PM">
                    6:00 PM - 7:00 PM
                </button>

                <button
                    type="button"
                    class="time-slot"
                    data-time="7:00 PM - 8:00 PM">
                    7:00 PM - 8:00 PM
                </button>

                <button
                    type="button"
                    class="time-slot"
                    data-time="8:00 PM - 9:00 PM">
                    8:00 PM - 9:00 PM
                </button>

                <button
                    type="button"
                    class="time-slot"
                    data-time="9:00 PM - 10:00 PM">
                    9:00 PM - 10:00 PM
                </button>

            </div>

            <button
                id="confirmBookingBtn"
                class="confirm-booking-btn">
                ✅ Confirm Booking
            </button>

        </div>
    `;

    document.body.appendChild(modal);

    const dateInput = document.getElementById("bookingDate");

    dateInput.addEventListener("change", () => {
        loadBookedSlots(turfId, dateInput.value);
    });

    const timeButtons =
        document.querySelectorAll(".time-slot");

    timeButtons.forEach(button => {

        button.addEventListener("click", () => {

            if (button.disabled) {
                return;
            }

            timeButtons.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");
        });

    });

    const confirmButton =
        document.getElementById("confirmBookingBtn");

    confirmButton.addEventListener("click", () => {

        const selectedButton =
            document.querySelector(".time-slot.selected");

        const selectedDate = dateInput.value;

        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        if (!selectedButton) {
            alert("Please select a time slot.");
            return;
        }

        confirmBooking(
            turfId,
            turfName,
            selectedDate,
            selectedButton.dataset.time
        );
    });

    loadBookedSlots(turfId, today);
}

// ============================================
// CLOSE BOOKING MODAL
// ============================================

function closeBookingModal() {
    const modal = document.getElementById("bookingModal");

    if (modal) {
        modal.remove();
    }
}

// ============================================
// LOAD BOOKED SLOTS
// ============================================

async function loadBookedSlots(turfId, date) {

    try {

        const response = await fetch(
            `${API_URL}/bookings/slots/${turfId}/${date}`
        );

        if (!response.ok) {
            return;
        }

        const bookedSlots = await response.json();

        const timeButtons =
            document.querySelectorAll(".time-slot");

        timeButtons.forEach(button => {

            const time = button.dataset.time;

            const isBooked =
                Array.isArray(bookedSlots) &&
                bookedSlots.includes(time);

            if (isBooked) {

                button.disabled = true;
                button.classList.add("booked");
                button.classList.remove("selected");

                button.textContent =
                    `${time} - BOOKED`;

            } else {

                button.disabled = false;
                button.classList.remove("booked");

                button.textContent = time;
            }

        });

    } catch (error) {
        console.error("Error loading booked slots:", error);
    }
}

// ============================================
// CONFIRM BOOKING
// ============================================

async function confirmBooking(
    turfId,
    turfName,
    date,
    timeSlot
) {

    const user = getUser();
    const token = getToken();

    if (!user || !token) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/bookings`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    userId: user.id,
                    turfId: turfId,
                    date: date,
                    timeSlot: timeSlot
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Booking failed.");
            return;
        }

        alert(
            `Booking successful!\n\n` +
            `Turf: ${turfName}\n` +
            `Date: ${date}\n` +
            `Time: ${timeSlot}`
        );

        closeBookingModal();

        await loadBookings();

        const myBookingsSection =
            document.getElementById("myBookingsSection");

        if (myBookingsSection) {
            myBookingsSection.scrollIntoView({
                behavior: "smooth"
            });
        }

    } catch (error) {

        console.error("Booking error:", error);

        alert(
            "Unable to complete booking. " +
            "Please make sure the server is running."
        );
    }
}

// ============================================
// LOAD MY BOOKINGS
// ============================================

async function loadBookings() {

    const user = getUser();

    if (!user) {

        const myBookings =
            document.getElementById("myBookings");

        if (myBookings) {

            myBookings.innerHTML = `
                <div class="empty-bookings">
                    <h3>🔐 Login Required</h3>
                    <p>
                        Login to view and manage your bookings.
                    </p>
                </div>
            `;
        }

        return;
    }

    try {

        // ========================================
        // GET ALL TURFS
        // ========================================

        const turfResponse =
            await fetch(`${API_URL}/turfs`);

        if (!turfResponse.ok) {
            throw new Error("Unable to load turfs");
        }

        const turfs = await turfResponse.json();

        // ========================================
        // CREATE TURF ID → TURF NAME MAP
        // ========================================

        const turfMap = {};

        turfs.forEach(turf => {

            turfMap[String(turf.id)] = turf.name;

        });

        // ========================================
        // GET USER BOOKINGS
        // ========================================

        const response =
            await fetch(
                `${API_URL}/bookings/${user.id}`
            );

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        const bookings = await response.json();

        const myBookings =
            document.getElementById("myBookings");

        if (!myBookings) {
            return;
        }

        // ========================================
        // NO BOOKINGS
        // ========================================

        if (!bookings || bookings.length === 0) {

            myBookings.innerHTML = `
                <div class="empty-bookings">

                    <h3>📭 No Bookings Yet</h3>

                    <p>
                        You have not made any turf bookings.
                    </p>

                </div>
            `;

            return;
        }

        // ========================================
        // DISPLAY BOOKINGS
        // ========================================

        myBookings.innerHTML = bookings.map(
            (booking, index) => {

                // Get turf name
                const turfName =
                    turfMap[String(booking.turfId)] ||
                    booking.turfName ||
                    "Turf";

                return `
                    <div class="booking-card">

                        <h3>
                            ⚽ Booking #${index + 1}
                        </h3>

                        <div class="booking-info">

                            <p>
                                <strong>⚽ Turf:</strong>
                                <span>
                                    ${turfName}
                                </span>
                            </p>

                            <p>
                                <strong>📅 Date:</strong>
                                <span>
                                    ${booking.date}
                                </span>
                            </p>

                            <p>
                                <strong>🕐 Time:</strong>
                                <span>
                                    ${booking.timeSlot}
                                </span>
                            </p>

                            <p>
                                <strong>📌 Status:</strong>
                                <span>
                                    ${booking.status}
                                </span>
                            </p>

                        </div>

                        ${booking.status === "Confirmed"
                        ?
                        `
                            <button
                                class="cancel-booking-btn"
                                onclick="cancelMyBooking('${booking._id}')">

                                ❌ Cancel Booking

                            </button>
                            `
                        :
                        `
                            <div class="booking-cancelled">

                                ❌ Booking Cancelled

                            </div>
                            `
                    }

                    </div>
                `;
            }
        ).join("");

    } catch (error) {

        console.error(
            "Error loading bookings:",
            error
        );

        const myBookings =
            document.getElementById("myBookings");

        if (myBookings) {

            myBookings.innerHTML = `
                <div class="empty-bookings">

                    <h3>⚠️ Unable to Load Bookings</h3>

                    <p>
                        Please make sure the backend
                        server is running.
                    </p>

                </div>
            `;
        }
    }
}

// ============================================
// CANCEL MY BOOKING
// ============================================

async function cancelMyBooking(bookingId) {

    const user = getUser();
    const token = getToken();

    if (!user || !token) {
        alert("Please login first.");
        return;
    }

    const confirmation =
        confirm(
            "Are you sure you want to cancel this booking?"
        );

    if (!confirmation) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${bookingId}/cancel`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        userId: user.id
                    })
                }
            );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to cancel booking."
            );

            return;
        }

        alert("Booking cancelled successfully.");

        await loadBookings();

    } catch (error) {

        console.error(
            "Cancellation error:",
            error
        );

        alert(
            "Unable to cancel booking. " +
            "Please try again."
        );
    }
}

// ============================================
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// ============================================

window.loadTurfs = loadTurfs;
window.loadBookings = loadBookings;
window.bookTurf = bookTurf;
window.cancelMyBooking = cancelMyBooking;
window.closeBookingModal = closeBookingModal;