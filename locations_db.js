/**
 * Database File: locations_db.js
 * Contains coordinates extracted for 🚩 emoji flag locations and standard set points.
 */

const FLAG_LOCATIONS_DATABASE = [
    { id: "flag_1", name: "Flag Location 1", category: "Flag Post", lat: 28.672809, lon: 77.413845, emoji: "🚩" },
    { id: "flag_2", name: "Flag Location 2", category: "Flag Post", lat: 28.455224, lon: 77.454525, emoji: "🚩" },
    { id: "flag_3", name: "Flag Location 3", category: "Flag Post", lat: 28.565421, lon: 77.526521, emoji: "🚩" },
    { id: "flag_4", name: "Flag Location 4", category: "Flag Post", lat: 28.381961, lon: 77.272702, emoji: "🚩" },
    { id: "flag_5", name: "Flag Location 5", category: "Flag Post", lat: 28.672540, lon: 77.408542, emoji: "🚩" },
    { id: "flag_6", name: "Flag Location 6", category: "Flag Post", lat: 28.662932, lon: 77.423781, emoji: "🚩" },
    { id: "flag_7", name: "Flag Location 7", category: "Flag Post", lat: 28.662945, lon: 77.423748, emoji: "🚩" },
    { id: "flag_8", name: "Flag Location 8", category: "Flag Post", lat: 28.649948, lon: 77.420624, emoji: "🚩" },
    { id: "flag_9", name: "Flag Location 9", category: "Flag Post", lat: 28.649900, lon: 77.420700, emoji: "🚩" },
    { id: "flag_10", name: "Flag Location 10", category: "Flag Post", lat: 28.658854, lon: 77.4203103, emoji: "🚩" },
    { id: "flag_11", name: "Flag Location 11", category: "Flag Post", lat: 28.642000, lon: 77.421700, emoji: "🚩" },
    { id: "flag_12", name: "Flag Location 12", category: "Flag Post", lat: 28.645486, lon: 77.421682, emoji: "🚩" },
    // Mandir & Gurudwara Locations
    { id: "mg_1", name: "Doodheshwar Nath Mandir", category: "Mandir", lat: 28.6650, lon: 77.4280, emoji: "🚩" },
    { id: "mg_2", name: "ISKCON Temple Ghaziabad", category: "Mandir", lat: 28.6850, lon: 77.4420, emoji: "🚩" },
    { id: "mg_3", name: "Mohan Nagar Mandir", category: "Mandir", lat: 28.6755, lon: 77.3825, emoji: "🚩" },
    { id: "mg_4", name: "Sai Baba Mandir Vasundhara", category: "Mandir", lat: 28.6580, lon: 77.3750, emoji: "🚩" },
    { id: "mg_5", name: "Hanuman Mandir Vijay Nagar", category: "Mandir", lat: 28.6410, lon: 77.4220, emoji: "🚩" },
    { id: "mg_6", name: "Gurudwara Singh Sabha GT Road", category: "Gurudwara", lat: 28.6630, lon: 77.4210, emoji: "🚩" },
    { id: "mg_7", name: "Gurudwara Sahib Raj Nagar", category: "Gurudwara", lat: 28.6830, lon: 77.4450, emoji: "🚩" },
    { id: "mg_8", name: "Gurudwara Sahib Sahibabad", category: "Gurudwara", lat: 28.6740, lon: 77.3520, emoji: "🚩" }
];

const DEFAULT_LOCATIONS = [
    ...FLAG_LOCATIONS_DATABASE,
    { id: "loc_1", name: "Main Pin Point", category: "General", lat: 28.6692, lon: 77.4538, emoji: "📍" },
    { id: "loc_3", name: "Carnival Event", category: "Entertainment", lat: 28.6700, lon: 77.4200, emoji: "🎪" },
    { id: "loc_4", name: "City Medical", category: "Healthcare", lat: 28.6500, lon: 77.4400, emoji: "🏥" },
    { id: "loc_5", name: "Lounge & Dining", category: "Hospitality", lat: 28.6300, lon: 77.4300, emoji: "🍷" },
    { id: "loc_6", name: "Cultural Shrine", category: "Heritage", lat: 28.6600, lon: 77.4100, emoji: "☪︎" }
];

/**
 * Route Helper Functions (Real Road Routing via OSRM)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateTotalRouteDistance(locs) {
    const arrayToUse = locs || FLAG_LOCATIONS_DATABASE;
    let totalKm = 0;
    for (let i = 0; i < arrayToUse.length - 1; i++) {
        totalKm += calculateDistanceKm(
            arrayToUse[i].lat, arrayToUse[i].lon,
            arrayToUse[i + 1].lat, arrayToUse[i + 1].lon
        );
    }
    return totalKm.toFixed(2);
}

function getRouteCoordinates(locs) {
    const arrayToUse = locs || FLAG_LOCATIONS_DATABASE;
    return arrayToUse.map(item => [item.lat, item.lon]);
}

/**
 * Fetch real driving road geometry (Google Maps style) using OSRM Public Routing API
 */
async function fetchRealRoadRoute(locs) {
    const arrayToUse = locs || FLAG_LOCATIONS_DATABASE;
    if (arrayToUse.length < 2) return null;

    const waypoints = arrayToUse.map(l => `${l.lon},${l.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const roadLatLngs = route.geometry.coordinates.map(c => [c[1], c[0]]);
            const distanceKm = (route.distance / 1000).toFixed(2);
            const durationMins = Math.round(route.duration / 60);

            return {
                roadLatLngs,
                distanceKm,
                durationMins
            };
        }
    } catch (err) {
        console.warn('OSRM Real Road Routing failed, falling back to straight lines:', err);
    }
    return null;
}

/**
 * Official Ghaziabad Police Patrol Corridors & Routes
 */
/**
 * Official Ghaziabad Police Patrol Corridors & Nearby Locations
 */
const GZB_POLICE_ROUTES = [
    {
        id: "route_1",
        name: "Route 1: Modinagar (Kadrabad) ➔ Sahibabad (Seema Border)",
        expectedKm: "39.0",
        waypoints: [
            { name: "Kadrabad Checkpost (Modinagar Entry)", type: "Checkpost", lat: 28.8550, lon: 77.5850, emoji: "🚩" },
            { name: "Modinagar Police Station & Bus Stand", type: "Police Station", lat: 28.8350, lon: 77.5750, emoji: "🏢" },
            { name: "SRM University / Sikanderpur Cut", type: "Landmark", lat: 28.8100, lon: 77.5400, emoji: "🏫" },
            { name: "Muradnagar Police Station & Canal", type: "Police Station", lat: 28.7800, lon: 77.5050, emoji: "🏢" },
            { name: "Ordnance Factory Muradnagar", type: "Landmark", lat: 28.7600, lon: 77.4800, emoji: "🏬" },
            { name: "Morta Flyover / Raj Nagar Extension Entry", type: "Flyover", lat: 28.7200, lon: 77.4450, emoji: "🌉" },
            { name: "ALT Centre / New Bus Adda Metro", type: "Metro Station", lat: 28.6780, lon: 77.4200, emoji: "🚇" },
            { name: "Mohan Nagar Intersection & Rapid Rail", type: "Intersection", lat: 28.6750, lon: 77.3820, emoji: "🚥" },
            { name: "Sahibabad Police Station & Industrial Area", type: "Police Station", lat: 28.6740, lon: 77.3550, emoji: "🏢" },
            { name: "Seema Border (Delhi-Ghaziabad Checkpost)", type: "Border Checkpost", lat: 28.6760, lon: 77.3400, emoji: "🚩" }
        ]
    },
    {
        id: "route_2",
        name: "Route 2: Nahar Wali Peer (Niwadi PS) ➔ Loni Border PS",
        expectedKm: "43.4",
        waypoints: [
            { name: "Nahar Wali Peer (Niwadi PS Start)", type: "Checkpost", lat: 28.8780, lon: 77.5450, emoji: "🚩" },
            { name: "Patla Checkpost & Niwadi Market", type: "Checkpost", lat: 28.8500, lon: 77.5300, emoji: "🚓" },
            { name: "Bhojpur Police Station", type: "Police Station", lat: 28.8050, lon: 77.4950, emoji: "🏢" },
            { name: "Modinagar-Niwadi Bypass", type: "Interchange", lat: 28.7650, lon: 77.4650, emoji: "🛣️" },
            { name: "Morta Chauraha Cut", type: "Intersection", lat: 28.7200, lon: 77.4350, emoji: "🚥" },
            { name: "Hindon River Bridge (Loni Road)", type: "Bridge", lat: 28.7220, lon: 77.3850, emoji: "🌉" },
            { name: "Banthla Flyover & Loni Circle", type: "Flyover", lat: 28.7300, lon: 77.3400, emoji: "🚥" },
            { name: "Loni Police Station", type: "Police Station", lat: 28.7280, lon: 77.3150, emoji: "🏢" },
            { name: "Loni Border Police Post (Delhi Border)", type: "Border Checkpost", lat: 28.7250, lon: 77.2950, emoji: "🚩" }
        ]
    },
    {
        id: "route_3",
        name: "Route 3: DME Kashi Toll Plaza ➔ UP Gate (Kaushambi PS)",
        expectedKm: "50.3",
        waypoints: [
            { name: "DME Kashi Toll Plaza (Meerut Border)", type: "Toll Plaza", lat: 28.8250, lon: 77.6200, emoji: "🚩" },
            { name: "Bhojpur DME Interchange", type: "Interchange", lat: 28.7750, lon: 77.5750, emoji: "🅿️" },
            { name: "Rasoolpur Sikrod Cut", type: "Interchange", lat: 28.7300, lon: 77.5400, emoji: "🛣️" },
            { name: "Dasna Toll Plaza & EPE Interchange", type: "Toll Plaza", lat: 28.6850, lon: 77.5250, emoji: "🅿️" },
            { name: "Wave City Interchange", type: "Interchange", lat: 28.6650, lon: 77.4750, emoji: "🛣️" },
            { name: "Vijay Nagar DME Sector 9 Cut", type: "Checkpost", lat: 28.6400, lon: 77.4200, emoji: "🚓" },
            { name: "Hindon Elevated Expressway Junction", type: "Elevated Road", lat: 28.6300, lon: 77.3700, emoji: "🌉" },
            { name: "Indirapuram DME Exit", type: "Exit", lat: 28.6280, lon: 77.3500, emoji: "🏬" },
            { name: "Kaushambi Police Station", type: "Police Station", lat: 28.6260, lon: 77.3350, emoji: "🏢" },
            { name: "UP Gate Border Checkpost (Ghazipur Border)", type: "Border Checkpost", lat: 28.6250, lon: 77.3250, emoji: "🚩" }
        ]
    }
];

if (typeof window !== 'undefined') {
    window.FLAG_LOCATIONS_DATABASE = FLAG_LOCATIONS_DATABASE;
    window.DEFAULT_LOCATIONS = DEFAULT_LOCATIONS;
    window.GZB_POLICE_ROUTES = GZB_POLICE_ROUTES;
    window.calculateDistanceKm = calculateDistanceKm;
    window.calculateTotalRouteDistance = calculateTotalRouteDistance;
    window.getRouteCoordinates = getRouteCoordinates;
    window.fetchRealRoadRoute = fetchRealRoadRoute;
}
