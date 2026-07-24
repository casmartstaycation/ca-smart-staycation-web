onst API = "https://ca-smart-staycation-muqd.onrender.com/api";

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

    const res = await fetch(`${API}/bookings`);
    const json = await res.json();

    let html = "<h2>Bookings</h2>";

    json.data.forEach(b => {
        html += `
        <div style="padding:10px;border-bottom:1px solid #ddd">
            <b>${b.bookingReference}</b><br>
            ${new Date(b.checkIn).toLocaleDateString()} →
            ${new Date(b.checkOut).toLocaleDateString()}<br>
            ₱${b.totalAmount}
        </div>
        `;
    });

    document.getElementById("output").innerHTML = html;
}

loadDashboard();

