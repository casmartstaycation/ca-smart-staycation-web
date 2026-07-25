const API = "https://ca-smart-staycation-muqd.onrender.com/api";

async function loadDashboard() {
    document.getElementById("title").innerText = "Dashboard";
    document.getElementById("output").innerHTML = `
        <h2>Welcome to CA Smart Staycation</h2>
        <p>Select a menu from the left.</p>
    `;
}

async function loadGuests() {
    document.getElementById("title").innerText = "Guests";

    const res = await fetch(`${API}/guests`);
    const json = await res.json();

    let html = "<h2>Guests</h2>";

    json.data.forEach(g => {
        html += `
        <div style="padding:10px;border-bottom:1px solid #ddd">
            <b>${g.firstName} ${g.lastName}</b><br>
            ${g.phone}<br>
            ${g.email}
        </div>
        `;
    });

    document.getElementById("output").innerHTML = html;
}

async function loadRooms() {
    document.getElementById("title").innerText = "Rooms";

    const res = await fetch(`${API}/rooms`);
    const json = await res.json();

    let html = "<h2>Rooms</h2>";

    json.data.forEach(r => {
        html += `
        <div style="padding:10px;border-bottom:1px solid #ddd">
            <b>Room ${r.roomNumber}</b><br>
            ${r.roomName}<br>
            ₱${r.price}
        </div>
        `;
    });

    document.getElementById("output").innerHTML = html;
}

async function loadBookings() {
    document.getElementById("title").innerText = "Bookings";

    const bookingRes = await fetch(`${API}/bookings`);
    const guestRes = await fetch(`${API}/guests`);
    const roomRes = await fetch(`${API}/rooms`);

    const bookings = (await bookingRes.json()).data;
    const guests = (await guestRes.json()).data;
    const rooms = (await roomRes.json()).data;

    let html = "<h2>Bookings</h2>";

    bookings.forEach(b => {

        const guest = guests.find(g => g._id === b.guest);
        const room = rooms.find(r => r._id === b.room);

        html += `
        <div style="padding:12px;border-bottom:1px solid #ddd">

            <b>${b.bookingReference}</b><br><br>

            <b>Guest:</b>
            ${guest ? guest.firstName + " " + guest.lastName : "Unknown"}<br>

            <b>Room:</b>
            ${room ? room.roomNumber + " - " + room.roomName : "Unknown"}<br>

            <b>Check In:</b>
            ${new Date(b.checkIn).toLocaleDateString()}<br>

            <b>Check Out:</b>
            ${new Date(b.checkOut).toLocaleDateString()}<br>

            <b>Adults:</b>
            ${b.adults}<br>

            <b>Children:</b>
            ${b.children}<br>

            <b>Total:</b>
            ₱${b.totalAmount}<br>

            <b>Payment:</b>
            ${b.paymentStatus}<br>

            <b>Status:</b>
            ${b.bookingStatus}

        </div>
        `;
    });

    document.getElementById("output").innerHTML = html;
}


loadDashboard();


async function showBookingForm() {
    document.getElementById("title").innerText = "New Booking";

    const guestRes = await fetch(`${API}/guests`);
    const roomRes = await fetch(`${API}/rooms`);

    const guests = (await guestRes.json()).data;
    const rooms = (await roomRes.json()).data;

    let guestOptions = "";
    guests.forEach(g => {
        guestOptions += `<option value="${g._id}">${g.firstName} ${g.lastName}</option>`;
    });

    let roomOptions = "";
    rooms.forEach(r => {
        roomOptions += `<option value="${r._id}">${r.roomNumber} - ${r.roomName}</option>`;
    });

    document.getElementById("output").innerHTML = `
        <h2>New Booking</h2>

        <form id="bookingForm">
            <label>Guest</label><br>
            <select id="guest">${guestOptions}</select><br><br>

            <label>Room</label><br>
            <select id="room" onchange="calculateTotal()">${roomOptions}</select>

<label>Check In</label><br>
<input type="date" id="checkIn" onchange="calculateTotal()"><br><br>

<label>Check Out</label><br>
<input type="date" id="checkOut" onchange="calculateTotal()"><br><br>

<p>
    <b>Total Amount:</b>
    <span id="totalAmount">₱0</span>
</p>

<button type="submit">Save Booking</button>
</form>



    document.getElementById("bookingForm").onsubmit = saveBooking;
}

async function saveBooking(e) {
    e.preventDefault();

    const booking = {
        bookingReference: "BK" + Date.now(),
        guest: document.getElementById("guest").value,
        room: document.getElementById("room").value,
        checkIn: document.getElementById("checkIn").value,
        checkOut: document.getElementById("checkOut").value,
        adults: 1,
        children: 0,
        totalAmount: Number(
    document.getElementById("totalAmount")
        .innerText
        .replace("₱", "")
        .replace(/,/g, "")
),
        paymentStatus: "Pending",
        bookingStatus: "Reserved",
        notes: ""
    };

    const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(booking)
    });

    const json = await res.json();

    if (json.status === "success") {
        alert("Booking saved!");
        loadBookings();
    } else {
        alert("Failed to save booking.");
        console.log(json);
    }
}

async function calculateTotal() {

    const roomId = document.getElementById("room").value;
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (!roomId || !checkIn || !checkOut) return;

    const res = await fetch(`${API}/rooms`);
    const rooms = (await res.json()).data;

    const room = rooms.find(r => r._id === roomId);

    if (!room) return;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const nights = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );

    const total = room.price * nights;

    document.getElementById("totalAmount").innerText =
        `₱${total.toLocaleString()}`;
}
