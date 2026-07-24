const API = "https://ca-smart-staycation-muqd.onrender.com/api";

async function loadGuests() {
    document.getElementById("title").innerText = "Guests";
    const content = document.getElementById("content");
    content.innerHTML = "Loading...";

    try {
        const res = await fetch(`${API}/guests`);
        const json = await res.json();

        if (!json.data.length) {
            content.innerHTML = "<p>No guests found.</p>";
            return;
        }

        content.innerHTML = json.data.map(g => `
            <div class="card">
                <h3>${g.firstName} ${g.lastName}</h3>
                <p>Email: ${g.email || "-"}</p>
                <p>Phone: ${g.phone}</p>
            </div>
        `).join("");

    } catch (err) {
        content.innerHTML = err.message;
    }
}

async function loadRooms() {
    document.getElementById("title").innerText = "Rooms";
    const content = document.getElementById("content");
    content.innerHTML = "Loading...";

    try {
        const res = await fetch(`${API}/rooms`);
        const json = await res.json();

        if (!json.data.length) {
            content.innerHTML = "<p>No rooms found.</p>";
            return;
        }

        content.innerHTML = json.data.map(r => `
            <div class="card">
                <h3>Room ${r.roomNumber}</h3>
                <p>${r.roomName}</p>
                <p>Category: ${r.category}</p>
                <p>Capacity: ${r.capacity}</p>
                <p>₱${r.price}</p>
                <p>Status: ${r.status}</p>
            </div>
        `).join("");

    } catch (err) {
        content.innerHTML = err.message;
    }
}

async function loadBookings() {
    document.getElementById("title").innerText = "Bookings";
    const content = document.getElementById("content");
    content.innerHTML = "Loading...";

    try {
        const res = await fetch(`${API}/bookings`);
        const json = await res.json();

        if (!json.data.length) {
            content.innerHTML = "<p>No bookings found.</p>";
            return;
        }

        content.innerHTML = json.data.map(b => `
            <div class="card">
                <h3>${b.bookingReference}</h3>
                <p>Guest ID: ${b.guest}</p>
                <p>Room ID: ${b.room}</p>
                <p>Check-in: ${new Date(b.checkIn).toLocaleDateString()}</p>
                <p>Check-out: ${new Date(b.checkOut).toLocaleDateString()}</p>
                <p>Total: ₱${b.totalAmount}</p>
                <p>Status: ${b.bookingStatus}</p>
            </div>
        `).join("");

    } catch (err) {
        content.innerHTML = err.message;
    }
}

// Load guests by default when the page opens
loadGuests();
