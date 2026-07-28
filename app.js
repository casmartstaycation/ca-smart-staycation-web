const API = "https://ca-smart-staycation-muqd.onrender.com/api";
let dashboardTimer = null;
function stopDashboardRefresh() {

    if (dashboardTimer) {
        clearInterval(dashboardTimer);
        dashboardTimer = null;
    }

}


/* =====================================
   GLOBAL VARIABLES
===================================== */

let bookedDates = [];

let selectedCheckIn = null;
let selectedCheckOut = null;

let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

/* =====================================
   DASHBOARD
===================================== */

async function loadDashboard() {
    if (dashboardTimer) {
    clearInterval(dashboardTimer);
}

    document.getElementById("title").innerText = "Dashboard";

    const roomRes = await fetch(`${API}/rooms`);
    const bookingRes = await fetch(`${API}/bookings`);
    const guestRes = await fetch(`${API}/guests`);

    const rooms = (await roomRes.json()).data;
    const bookings = (await bookingRes.json()).data;
    const guests = (await guestRes.json()).data;

    const today = new Date();

    let available = 0;
    let reserved = 0;
    let checkedIn = 0;
    let arrivals = 0;
    let departures = 0;
    let revenue = 0;
    let notifications = [];

    rooms.forEach(room => {

        const booking = bookings.find(b =>
            b.room === room._id &&
            new Date(b.checkIn) <= today &&
            new Date(b.checkOut) > today
        );

        if (!booking) {

            available++;

        } else {

            if (booking.bookingStatus === "Reserved")
                reserved++;

            if (booking.bookingStatus === "Checked In")
                checkedIn++;

        }

    });

    bookings.forEach(b => {

        const inDate = new Date(b.checkIn).toDateString();
        const outDate = new Date(b.checkOut).toDateString();
        const todayStr = today.toDateString();

        if (inDate === todayStr)
            arrivals++;

        if (outDate === todayStr)
            departures++;

        revenue += Number(b.totalAmount || 0);

        const guest = guests.find(g => g._id === b.guest);

const guestName = guest
    ? `${guest.firstName} ${guest.lastName}`
    : "Unknown";

if (inDate === todayStr) {

    notifications.push(
        `🛎 Arrival Today: ${guestName}`
    );

}

if (outDate === todayStr) {

    notifications.push(
        `🚪 Departure Today: ${guestName}`
    );

}

if (b.bookingStatus === "Reserved") {

    notifications.push(
        `📌 Waiting Check-In: ${guestName}`
    );

}

if (b.paymentStatus === "Pending") {

    notifications.push(
        `💰 Pending Payment: ${guestName}`
    );

}

    });

    document.getElementById("output").innerHTML = `

    <h2>Notifications</h2>

<div style="
background:#fff3cd;
padding:15px;
border-radius:10px;
margin-bottom:20px;
">

${
notifications.length
? notifications.map(n=>`<div>${n}</div>`).join("")
: "<div>✅ No notifications.</div>"
}

</div>

    <div style="display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:15px;">

<div style="background:#d4edda;padding:20px;border-radius:10px;">
<h2>${rooms.length}</h2>
<b>Total Rooms</b>
</div>

<div style="background:#d1ecf1;padding:20px;border-radius:10px;">
<h2>${available}</h2>
<b>Available Rooms</b>
</div>

<div style="background:#fff3cd;padding:20px;border-radius:10px;">
<h2>${reserved}</h2>
<b>Reserved Rooms</b>
</div>

<div style="background:#cfe2ff;padding:20px;border-radius:10px;">
<h2>${checkedIn}</h2>
<b>Checked In</b>
</div>

<div style="background:#f8d7da;padding:20px;border-radius:10px;">
<h2>${arrivals}</h2>
<b>Today's Arrivals</b>
</div>

<div style="background:#e2e3e5;padding:20px;border-radius:10px;">
<h2>${departures}</h2>
<b>Today's Departures</b>
</div>

<div style="background:#d1e7dd;padding:20px;border-radius:10px;">
<h2>₱${revenue.toLocaleString()}</h2>
<b>Total Revenue</b>
</div>

</div>

<br>

<h2>Quick Actions</h2>

<button onclick="showBookingForm()">
New Booking
</button>

<button onclick="loadRoomStatus()">
Unit Status
</button>

<button onclick="loadGuests()">
Guests
</button>

<button onclick="loadBookings()">
Bookings
</button>

<br><br>

<h2>Today's Activity</h2>

<div style="
    background:#ffffff;
    border:1px solid #ddd;
    border-radius:10px;
    padding:20px;
">

<p><b>Today's Arrivals:</b> ${arrivals}</p>

<p><b>Today's Departures:</b> ${departures}</p>

<p><b>Rooms Available:</b> ${available}</p>

<p><b>Rooms Occupied:</b> ${checkedIn}</p>

</div>

<br><br>

<h2>Recent Bookings</h2>

<table style="
width:100%;
border-collapse:collapse;
">

<tr style="background:#f5f5f5;">

<th style="padding:10px;border:1px solid #ddd;">Reference</th>

<th style="padding:10px;border:1px solid #ddd;">Room</th>

<th style="padding:10px;border:1px solid #ddd;">Check In</th>

<th style="padding:10px;border:1px solid #ddd;">Status</th>

</tr>

${
bookings
.slice()
.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))
.slice(0,5)
.map(b=>{

const room=rooms.find(r=>r._id===b.room);

return`

<tr>

<td style="padding:10px;border:1px solid #ddd;">
${b.bookingReference}
</td>

<td style="padding:10px;border:1px solid #ddd;">
${room?room.roomNumber:"-"}
</td>

<td style="padding:10px;border:1px solid #ddd;">
${new Date(b.checkIn).toLocaleDateString()}
</td>

<td style="padding:10px;border:1px solid #ddd;">
${b.bookingStatus}
</td>

</tr>

`;

}).join("")
}

</table>

    `;

   dashboardTimer = setInterval(async () => {

    if (document.getElementById("title").innerText !== "Dashboard") {
        clearInterval(dashboardTimer);
        dashboardTimer = null;
        return;
    }

    loadDashboard();

}, 30000);
    
}



/* =====================================
   GUESTS
===================================== */

async function loadGuests(){

    stopDashboardRefresh();

    document.getElementById("title").innerText="Guests";

    const res=await fetch(`${API}/guests`);

    const guests=(await res.json()).data;

    let html="<h2>Guests</h2>";

    guests.forEach(g=>{

        html+=`

        <div style="
            padding:12px;
            border-bottom:1px solid #ddd;
        ">

            <b>${g.firstName} ${g.lastName}</b><br>

            ${g.phone}<br>

            ${g.email}

        </div>

        `;

    });

    document.getElementById("output").innerHTML=html;

}

async function loadParking() {

    document.getElementById("title").innerText = "Parking Management";

    const res = await fetch(`${API}/parking`);
    const parkings = (await res.json()).data;

    let html = `
        <h2>Parking Management</h2>

        <button onclick="showParkingForm()">
            ➕ Add Parking
        </button>

        <br><br>

        <table border="1" width="100%" cellpadding="8">

        <tr>

            <th>Parking No.</th>
            <th>Name</th>
            <th>Rate</th>
            <th>Status</th>
            <th>Action</th>

        </tr>
    `;

    parkings.forEach(p => {

        html += `
        <tr>

            <td>${p.parkingNumber}</td>
            <td>${p.parkingName}</td>
            <td>₱${p.rate}</td>
            <td>${p.status}</td>

            <td>

                <button onclick="editParking('${p._id}')">
                    ✏ Edit
                </button>

                <button onclick="deleteParking('${p._id}')">
                    🗑 Delete
                </button>

            </td>

        </tr>
        `;

    });

    html += "</table>";

    document.getElementById("output").innerHTML = html;

}

function showParkingForm() {

document.getElementById("output").innerHTML = `

<h2>Add Parking</h2>

<label>

Parking Number

</label>

<input id="parkingNumber">

<br><br>

<label>

Parking Name

</label>

<input id="parkingName" value="Main Parking">

<br><br>

<label>

Rate

</label>

<input
type="number"
id="parkingRate"
value="500">

<br><br>

<button onclick="saveParking()">

Save Parking

</button>

`;

}

async function saveParking() {

const parkingNumber =
document.getElementById("parkingNumber").value.trim().toUpperCase();

const parkingName =
document.getElementById("parkingName").value;

const rate =
Number(document.getElementById("parkingRate").value);

const res = await fetch(`${API}/parking`, {

method: "POST",

headers: {

"Content-Type": "application/json"

},

body: JSON.stringify({

parkingNumber,

parkingName,

rate,

status: "Available"

})

});

const json = await res.json();

if (json.status == "success") {

alert("Parking added.");

loadParking();

}
else{

alert(json.message);

}

}

/* =====================================
   ROOMS
===================================== */

async function loadRooms(){

    stopDashboardRefresh();

    document.getElementById("title").innerText = "Unit Management";

    const res=await fetch(`${API}/rooms`);

    const rooms=(await res.json()).data;

    let html="<h2>Rooms</h2>";

    rooms.forEach(r=>{

        html+=`

        <div style="
            padding:12px;
            border-bottom:1px solid #ddd;
        ">

            <b>Room ${r.roomNumber}</b><br>

            ${r.roomName}<br>

            Capacity : ${r.capacity}<br>

            Price : ₱${Number(r.price).toLocaleString()}

        </div>

        `;

    });

    document.getElementById("output").innerHTML=html;

}

/* =====================================
   START APP
===================================== */

loadDashboard();

/* =====================================
   BOOKINGS
===================================== */

async function loadBookings() {

    stopDashboardRefresh();

    document.getElementById("title").innerText = "Bookings";

    const bookingRes = await fetch(`${API}/bookings`);
    const guestRes = await fetch(`${API}/guests`);
    const roomRes = await fetch(`${API}/rooms`);

    const bookings = (await bookingRes.json()).data;
    const guests = (await guestRes.json()).data;
    const rooms = (await roomRes.json()).data;

    let html = `
        <div style="display:flex;justify-content:space-between;align-items:center">

            <h2>Bookings</h2>

            <button onclick="showBookingForm()">
                + New Booking
            </button>

        </div>
    `;

    bookings.forEach(b => {

        const guest = guests.find(g => g._id === b.guest);
        const room = rooms.find(r => r._id === b.room);

        html += `

        <div style="
            border:1px solid #ddd;
            border-radius:8px;
            padding:15px;
            margin-bottom:10px;
        ">

            <b>${b.bookingReference}</b>

            <hr>

            <b>Guest:</b>
            ${guest ? guest.firstName + " " + guest.lastName : "-"}

            <br>

            <b>Room:</b>
            ${room ? room.roomNumber + " - " + room.roomName : "-"}

            <br>

            <b>Check In:</b>
            ${new Date(b.checkIn).toLocaleDateString()}

            <br>

            <b>Check Out:</b>
            ${new Date(b.checkOut).toLocaleDateString()}

            <br>

            <b>Adults:</b>
            ${b.adults}

            <br>

            <b>Children:</b>
            ${b.children}

            <br>

            <b>Total:</b>

            ₱${Number(b.totalAmount).toLocaleString()}

            <br>

            <b>Status:</b>

            ${b.bookingStatus}

            <br>

            <b>Payment:</b>

            ${b.paymentStatus}

        </div>

        `;

    });

    document.getElementById("output").innerHTML = html;

}

/* =====================================
   NEW BOOKING FORM
===================================== */

async function showBookingForm() {

    stopDashboardRefresh();

    document.getElementById("title").innerText = "New Booking";

    const guestRes = await fetch(`${API}/guests`);
    const roomRes = await fetch(`${API}/rooms`);

    const guests = (await guestRes.json()).data;
    const rooms = (await roomRes.json()).data;

    let guestOptions = "";

    guests.forEach(g => {

        guestOptions += `
            <option value="${g._id}">
                ${g.firstName} ${g.lastName}
            </option>
        `;

    });

    let roomOptions = "";

    rooms.forEach(r => {

        roomOptions += `
            <option value="${r._id}">
                ${r.roomNumber} - ${r.roomName}
            </option>
        `;

    });

    selectedCheckIn = null;
    selectedCheckOut = null;

    document.getElementById("output").innerHTML = `

    <h3>Booking Type</h3>

<select id="bookingType" onchange="bookingTypeChanged()">

    <option value="unit">
        Accommodation Only
    </option>

    <option value="parking">
        Parking Only
    </option>

    <option value="both">
        Accommodation + Parking
    </option>

</select>

<br><br>

<h2>New Booking</h2>

<form id="bookingForm">

<label>Guest</label><br>

<select id="guest">

${guestOptions}

</select>

<br><br>

<label>Available Room</label><br>

<select
id="room"
onchange="calculateTotal()">

<option value="">

Select Check-in & Check-out first

</option>

</select>

<br><br>

<input type="hidden" id="checkIn">

<input type="hidden" id="checkOut">

<div id="bookingCalendar"></div>

<br>

<div id="selectedDates">

<br>



<br><br>

No dates selected

</div>

<br><br>

<label>Adults</label><br>

<input
type="number"
id="adults"
value="2"
min="2"
max="4"
onchange="calculateTotal()">

<br><br>

<label>Children (0-2 years old)</label><br>

<input
type="number"
id="children"
value="0"
min="0">

<br><br>

<label>

<input
type="checkbox"
id="parking"
onchange="calculateTotal()">

Parking (+₱500/night)

</label>

<hr>

<div id="breakdown">

<b>Room Charge:</b> ₱0<br>

<b>Extra Adult:</b> ₱0<br>

<b>Parking:</b> ₱0<br>

<b>Security Deposit:</b> ₱1,000<br><br>

<h3>

Total Amount

<span id="totalAmount">

₱1,000

</span>

</h3>

</div>

<br>

<button type="submit">

Save Booking

</button>

</form>

`;

    document
        .getElementById("bookingForm")
        .addEventListener("submit", saveBooking);

    await loadBookingCalendar();

}

/* =====================================
   BOOKING CALENDAR
===================================== */

async function loadBookingCalendar() {

    const res = await fetch(`${API}/bookings`);
    const bookings = (await res.json()).data;

    bookedDates = [];

    bookings.forEach(b => {

        let current = new Date(b.checkIn);
        const end = new Date(b.checkOut);

        while (current < end) {

            bookedDates.push(
                current.toISOString().split("T")[0]
            );

            current.setDate(current.getDate() + 1);

        }

    });

    drawCalendar();

}

function drawCalendar() {

    const monthNames = [

        "January","February","March","April","May","June",

        "July","August","September","October","November","December"

    ];

    let html = `

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">

<button onclick="previousMonth()">

◀ Previous

</button>

<h3>

${monthNames[calendarMonth]} ${calendarYear}

</h3>

<button onclick="nextMonth()">

Next ▶

</button>

</div>

<div style="
display:grid;
grid-template-columns:repeat(7,1fr);
gap:5px;
text-align:center;
font-weight:bold;
">

<div>Sun</div>
<div>Mon</div>
<div>Tue</div>
<div>Wed</div>
<div>Thu</div>
<div>Fri</div>
<div>Sat</div>

`;

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();

    const days = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        html += `<div></div>`;

    }

    const today = new Date();

    today.setHours(0,0,0,0);

    for (let d = 1; d <= days; d++) {

        const date = new Date(calendarYear, calendarMonth, d);

        const dateString = date.toISOString().split("T")[0];

        const isPast = date < today;

        const isBooked = bookedDates.includes(dateString);

        let blockedAfterCheckIn = false;

if (selectedCheckIn && dateString > selectedCheckIn) {

    let current = new Date(selectedCheckIn);
    current.setDate(current.getDate() + 1);

    while (current < date) {

        const d = current.toISOString().split("T")[0];

        if (bookedDates.includes(d)) {
            blockedAfterCheckIn = true;
            break;
        }

        current.setDate(current.getDate() + 1);
    }
}

        let color = "white";

        if (isPast) color = "#eeeeee";

        if (isBooked) color = "#ffb3b3";

        if (blockedAfterCheckIn)
    color = "#dddddd";

        if (selectedCheckIn == dateString)
            color = "#4caf50";

        if (selectedCheckOut == dateString)
            color = "#2196f3";

        if (
            selectedCheckIn &&
            selectedCheckOut &&
            dateString > selectedCheckIn &&
            dateString < selectedCheckOut
        ){
            color="#9fd3ff";
        }

        html += `

<div
onclick="${(isPast || isBooked) ? "" : `selectDate('${dateString}')`}"
style="
padding:10px;
border:1px solid #ccc;
border-radius:6px;
background:${color};
cursor:${(isPast || isBooked || blockedAfterCheckIn) ? "not-allowed":"pointer"};
text-align:center;
">

${d}

</div>

`;

    }

    html += "</div>";

    document.getElementById("bookingCalendar").innerHTML = html;

}

function selectDate(date){

    if(selectedCheckIn==null){

        selectedCheckIn=date;

        document.getElementById("checkIn").value=date;

        document.getElementById("selectedDates").innerHTML=
        `Check In: <b>${date}</b><br>Select a Check Out date`;

        drawCalendar();

        return;
    }

    if(selectedCheckOut==null){

        if(new Date(date)<=new Date(selectedCheckIn)){

            alert("Check-out must be after Check-in.");

            return;
        }

        

        
        selectedCheckOut=date;

        document.getElementById("checkOut").value = date;

        document.getElementById("selectedDates").innerHTML = `
        <b>Check In:</b> ${selectedCheckIn}<br>
        <b>Check Out:</b> ${selectedCheckOut}
        `;

        drawCalendar();
        // Automatically load available rooms
        searchAvailableRooms();

        calculateTotal();

        return;
    }

    // Third click starts over
    selectedCheckIn=date;
    selectedCheckOut=null;

    document.getElementById("checkIn").value=date;
    document.getElementById("checkOut").value="";

    document.getElementById("selectedDates").innerHTML=
    `Check In: <b>${date}</b><br>Select a Check Out date`;

    drawCalendar();

}

function previousMonth(){

    calendarMonth--;

    if(calendarMonth<0){

        calendarMonth=11;

        calendarYear--;

    }

    drawCalendar();

}

function nextMonth(){

    calendarMonth++;

    if(calendarMonth>11){

        calendarMonth=0;

        calendarYear++;

    }

    drawCalendar();

}

async function calculateTotal() {

    const roomId = document.getElementById("room").value;
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (!roomId || !checkIn || !checkOut) return;

    const adults = Number(document.getElementById("adults").value);
    const parking = document.getElementById("parking").checked;

    const res = await fetch(`${API}/rooms`);
    const rooms = (await res.json()).data;

    const room = rooms.find(r => r._id === roomId);

    if (!room) return;

    const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) /
        (1000 * 60 * 60 * 24)
    );

    const roomCharge = room.price * nights;
    const extraAdult = Math.max(0, adults - 2) * 300 * nights;
    const parkingCharge = parking ? 500 * nights : 0;
    const securityDeposit = 1000;

    const total =
        roomCharge +
        extraAdult +
        parkingCharge +
        securityDeposit;

    document.getElementById("breakdown").innerHTML = `

<b>Room Charge:</b> ₱${roomCharge.toLocaleString()}<br>

<b>Extra Adult:</b> ₱${extraAdult.toLocaleString()}<br>

<b>Parking:</b> ₱${parkingCharge.toLocaleString()}<br>

<b>Security Deposit:</b> ₱${securityDeposit.toLocaleString()}<br><br>

<h3>

Total Amount

<span id="totalAmount">

₱${total.toLocaleString()}

</span>

</h3>

`;

}

async function searchAvailableRooms() {

    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (!checkIn || !checkOut) {
        alert("Please select Check-in and Check-out dates first.");
        return;
    }

    const roomRes = await fetch(`${API}/rooms`);
    const bookingRes = await fetch(`${API}/bookings`);

    const rooms = (await roomRes.json()).data;
    const bookings = (await bookingRes.json()).data;

    const roomSelect = document.getElementById("room");

    roomSelect.innerHTML =
        `<option value="">Select Room</option>`;

    rooms.forEach(room => {

        const occupied = bookings.some(b => {

            if (b.room !== room._id) return false;

            return (
                new Date(checkIn) < new Date(b.checkOut) &&
                new Date(checkOut) > new Date(b.checkIn)
            );

        });

        if (!occupied) {

            roomSelect.innerHTML += `
                <option value="${room._id}">
                    ${room.roomNumber} - ${room.roomName}
                    (₱${Number(room.price).toLocaleString()}/night)
                </option>
            `;

        }

    });

    if (roomSelect.options.length === 1) {

        roomSelect.innerHTML =
            `<option>No rooms available</option>`;

    }

}

async function saveBooking(e){

    e.preventDefault();

    const booking={

        bookingReference:"BK"+Date.now(),

        guest:document.getElementById("guest").value,

        room:document.getElementById("room").value,

        checkIn:document.getElementById("checkIn").value,

        checkOut:document.getElementById("checkOut").value,

        adults:Number(document.getElementById("adults").value),

        children:Number(document.getElementById("children").value),

        parking:document.getElementById("parking").checked,

        totalAmount:Number(
            document.getElementById("totalAmount")
            .innerText
            .replace("₱","")
            .replace(/,/g,"")
        ),

        paymentStatus:"Pending",

        bookingStatus:"Reserved",

        notes: "",

        housekeepingStatus: "Clean"

    };

    const res=await fetch(`${API}/bookings`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(booking)

    });

    const json=await res.json();

   if (json.status === "success") {

    alert("Booking Saved Successfully!");

    // Refresh the booking list
    await loadBookings();

    // Reset calendar selections
    selectedCheckIn = null;
    selectedCheckOut = null;

    // Reload booked dates in memory
    const bookingRes = await fetch(`${API}/bookings`);
    bookedDates = [];

    (await bookingRes.json()).data.forEach(b => {

        let current = new Date(b.checkIn);
        const end = new Date(b.checkOut);

        while (current < end) {

            bookedDates.push(
                current.toISOString().split("T")[0]
            );

            current.setDate(current.getDate() + 1);

        }

    });

} else {

    alert(json.message || "Unable to save booking.");

}
}

async function loadRoomStatus() {

    stopDashboardRefresh();

    document.getElementById("title").innerText = "Unit Status";

    const roomRes = await fetch(`${API}/rooms`);
    const bookingRes = await fetch(`${API}/bookings`);
    const guestRes = await fetch(`${API}/guests`);

    const rooms = (await roomRes.json()).data;
    const bookings = (await bookingRes.json()).data;
    const guests = (await guestRes.json()).data;

    const today = new Date();

    let html = "<h2>Unit Status</h2>";

    rooms.forEach(room => {

        let status = "🟢 Available";
        let housekeeping = "Clean";
        let guestName = "-";
        let cardColor = "#d4edda";

       const booking = bookings
    .filter(b => b.room === room._id)
    .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut))[0];
        

       if (booking) {

    if (booking.bookingStatus === "Reserved") {

    status = "🟡 Reserved";
    cardColor = "#fff3cd";

}
else if (booking.bookingStatus === "Checked In") {

    status = "🔵 Checked In";
    cardColor = "#cfe2ff";

}
else if (booking.bookingStatus === "Checked Out") {

    if (booking.housekeepingStatus === "Clean") {

        status = "🟢 Available";
        cardColor = "#d4edda";
        housekeeping = "Clean";
        guestName = "-";

    } else {

        status = "🧹 Needs Cleaning";
        cardColor = "#ffe5b4";
        housekeeping = "Needs Cleaning";

    }

}

    const guest = guests.find(g => g._id === booking.guest);

if (booking.bookingStatus !== "Checked Out" || booking.housekeepingStatus !== "Clean") {
    guestName = guest
        ? `${guest.firstName} ${guest.lastName}`
        : "Unknown";
}

}

        html += `
        <div style="
            background:${cardColor};
            border:1px solid #ccc;
            border-radius:10px;
            padding:15px;
            margin-bottom:12px;
        ">

            <h3>Room ${room.roomNumber}</h3>

            <b>${room.roomName}</b>

            <br><br>

            Status: ${status}

            <br>

            Guest: ${guestName}
            <br>

Housekeeping:
${
housekeeping === "Clean"
? `<span style="color:green;font-weight:bold;">🟢 Clean</span>`
: `<span style="color:#d97706;font-weight:bold;">🧹 Needs Cleaning</span>`
}

            <br><br>

            ${booking ? `
    <br><br>

<button onclick="viewRoomBooking('${room._id}')">
    👁 View
</button>

${
booking && booking.bookingStatus === "Reserved"
? `
<button onclick="checkInGuest('${room._id}')">
    ✅ Check In
</button>
`
: ""
}

${
booking.bookingStatus === "Checked In"
? `<button onclick="checkOutGuest('${room._id}')">
        Check Out
   </button>`
: ""
}

${
booking.bookingStatus === "Checked Out" &&
booking.housekeepingStatus !== "Clean"
? `<button onclick="markRoomClean('${room._id}')">
    ✓ Mark Clean
</button>`
: ""
}

` : `
    <button onclick="showBookingForm()">
        New Booking
    </button>
`}

        </div>
        `;

    });

    document.getElementById("output").innerHTML = html;

}

async function viewRoomBooking(roomId) {

    const bookingRes = await fetch(`${API}/bookings`);
    const guestRes = await fetch(`${API}/guests`);
    const roomRes = await fetch(`${API}/rooms`);

    const bookings = (await bookingRes.json()).data;
    const guests = (await guestRes.json()).data;
    const rooms = (await roomRes.json()).data;

    const booking = bookings.find(b => b.room === roomId);

    if (!booking) {

        alert("No active booking.");

        return;

    }

    const guest = guests.find(g => g._id === booking.guest);
    const room = rooms.find(r => r._id === booking.room);

    document.getElementById("title").innerText = "Booking Details";

    document.getElementById("output").innerHTML = `
        <h2>Booking Details</h2>

        <p><b>Booking Ref:</b> ${booking.bookingReference}</p>

        <p><b>Guest:</b>
        ${guest ? guest.firstName + " " + guest.lastName : "-"}</p>

        <p><b>Room:</b>
        ${room ? room.roomNumber + " - " + room.roomName : "-"}</p>

        <p><b>Check In:</b>
        ${new Date(booking.checkIn).toLocaleDateString()}</p>

        <p><b>Check Out:</b>
        ${new Date(booking.checkOut).toLocaleDateString()}</p>

        <p><b>Adults:</b> ${booking.adults}</p>

        <p><b>Children:</b> ${booking.children}</p>

        <p><b>Total:</b>
        ₱${Number(booking.totalAmount).toLocaleString()}</p>

        <p><b>Payment:</b>
        ${booking.paymentStatus}</p>

        <p><b>Status:</b>
        ${booking.bookingStatus}</p>

        <br>

        <button onclick="loadRoomStatus()">
            ← Back
        </button>
    `;

}

async function checkInGuest(roomId) {

    const bookingRes = await fetch(`${API}/bookings`);
    const bookings = (await bookingRes.json()).data;

    const booking = bookings.find(b =>
        b.room === roomId &&
        b.bookingStatus === "Reserved"
    );

    if (!booking) {

        alert("No reserved booking found.");

        return;

    }

    const res = await fetch(`${API}/bookings/${booking._id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            bookingStatus: "Checked In"

        })

    });

    const json = await res.json();
    console.log(json.data);
    

    if (json.status === "success") {

        alert("Guest checked in successfully.");

        loadRoomStatus();

    } else {

        alert("Check-in failed.");

    }

}

async function checkOutGuest(roomId) {

    const bookingRes = await fetch(`${API}/bookings`);
    const bookings = (await bookingRes.json()).data;

    const booking = bookings.find(b =>
        b.room === roomId &&
        b.bookingStatus === "Checked In"
    );

    if (!booking) {
        alert("No checked-in guest found.");
        return;
    }

    if (!confirm("Check out this guest?")) return;

    const res = await fetch(`${API}/bookings/${booking._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
    bookingStatus: "Checked Out",
    housekeepingStatus: "Needs Cleaning"
})
    });

    const json = await res.json();
    console.log("Check Out Response:");
console.log(JSON.stringify(json.data, null, 2));
    

    if (json.status === "success") {
    alert("Guest checked out successfully.");
    loadRoomStatus();
} else {
    alert("Check-out failed.");
    console.log(json);
    }

}

async function markRoomClean(roomId) {

    const bookingRes = await fetch(`${API}/bookings`);
    const bookings = (await bookingRes.json()).data;

    const booking = bookings.find(b =>
        b.room === roomId &&
        b.bookingStatus === "Checked Out"
    );

    if (!booking) {
        alert("No room needs cleaning.");
        return;
    }

    const res = await fetch(`${API}/bookings/${booking._id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            housekeepingStatus: "Clean"

        })

    });

    const json = await res.json();
    console.log(json.data);

console.log(json);

    if (json.status === "success") {

        alert("Room marked as clean.");

        loadRoomStatus();

    } else {

        alert("Failed to update housekeeping.");

    }

}

async function loadUnits() {

    document.getElementById("title").innerText = "Unit Management";

    const res = await fetch(`${API}/rooms`);

    const units = (await res.json()).data;

    let html = `

    <h2>Unit Management</h2>

    <button onclick="showAddUnitForm()">
        ➕ Add New Unit
    </button>

    <br><br>

    <table border="1" width="100%" cellpadding="8">

        <tr>

            <th>Unit Number</th>

            <th>Unit Name</th>

            <th>Rate</th>

            <th>Status</th>

            <th>Action</th>

        </tr>

    `;

    units.forEach(unit => {

        html += `

        <tr>

            <td>${unit.roomNumber}</td>

            <td>${unit.roomName}</td>

            <td>₱${unit.rate.toLocaleString()}</td>

            <td>${unit.status}</td>

            <td>

                <button onclick="editUnit('${unit._id}')">
                    ✏ Edit
                </button>

                <button onclick="deleteUnit('${unit._id}')">
                    🗑 Delete
                </button>

            </td>

        </tr>

        `;

    });

    html += "</table>";

    document.getElementById("output").innerHTML = html;

}

function showAddUnitForm() {

document.getElementById("output").innerHTML = `

<h2>Add Unit</h2>

<label>

Unit Number

</label>

<input id="unitNumber">

<br><br>

<label>

Unit Name

</label>

<input id="unitName">

<br><br>

<label>

Rate

</label>

<input
type="number"
id="unitRate">

<br><br>

<button onclick="saveUnit()">

Save Unit

</button>

`;

}

async function saveUnit() {

    

const roomNumber =
document.getElementById("unitNumber").value;

const roomName =
document.getElementById("unitName").value;

const rate =
Number(document.getElementById("unitRate").value);



const res = await fetch(`${API}/rooms`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

roomNumber,

roomName,

rate,

status:"Available"

})

});

const json = await res.json();

if(json.status=="success"){

alert("Unit added.");

loadUnits();

}
else{

alert(json.message);

}

}

