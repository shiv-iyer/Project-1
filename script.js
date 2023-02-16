
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// add marker1 with any coordinates, will use Bishan Dog Park
const marker1 = L.marker([1.362372, 103.84859]);

// marker icon will not have a shadow for now
const markerIcon = L.icon({
    iconUrl: '/images/pawbase-border.png',

    iconSize:     [50, 50], // size in pixels
    //iconAnchor:   [22, 94], 
    //popupAnchor:  [-3, -76] 
});

// custom marker icon test at Duxton Plain Dog Run
const markerCustomIcon = L.marker([1.277601, 103.841688], {icon: markerIcon});

// add circle with any coordinates, will use Commonwealth Dog Run
const circle1 = L.circle([1.304987, 103.797131], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

// gave up on polygons for now

// Unsure whether to write functions at the top or bottom (bc they are hoisted anyways). Will do bottom for now... used to from Java

// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// next step: plot leaflet markers
marker1.addTo(map);

// next step: add popups to the map layers
marker1.bindPopup("I am a marker at Bishan Dog Park!");
circle1.bindPopup("I am a circle at Commonwealth Dog Run!");
markerCustomIcon.bindPopup("I am a marker with a custom icon at Duxton Plain!");

markerCustomIcon.addTo(map);

loadData(fourSquareURL);

// try out a standalone popup
const testPopup = L.popup()
    .setLatLng([1.345516, 103.788447])
    .setContent("Standalone popup test at PIE Dog Run!")
    .openOn(map);

// add clickable functionality for anywhere on the map
let clickyPopup = L.popup();

function onMapClick(e) {
    clickyPopup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

searchButton.addEventListener('click', function(){
    alert("Hello World");
    const searchValue = document.getElementById("searchValue").value;
    loadData(fourSquareURL, sgLatLong, "pet cafe");
});

// ALL FUNCTIONS

function transformLatLng(initialLL){
    return(initialLL.split(","));
}

// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url){
    const response = await axios.get(url, {
        headers: {
            // Use capital letters for these. Accept is for (idk)
            Accept: "application/json",
            // Authorization is for using your own API key to access
            Authorization: FOURSQUARE_API_KEY
        },
        "params":{
            ll: sgLatLong,
            query: "pet cafe"
        }
    });

    console.log(response.data);
}