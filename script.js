
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// add marker1 with any coordinates, will use Bishan Dog Park
const marker1 = L.marker([1.362372, 103.84859]);

const markerIcon = L.icon({
    iconUrl: '/images/pawbase-border.png',

    iconSize:     [50, 50], // size in pixels
});

const markerCustomIcon = L.marker([1.277601, 103.841688], {icon: markerIcon});


// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


markerCustomIcon.addTo(map);

// const group1 = L.layerGroup();
// const group2 = L.layerGroup();
// const group3 = L.layerGroup();
// const groupArray = [group1, group2, group3];

// for (let i = 0; i < 3; i++){
//     let leafletMarker;
//     for (let j = 0; j < 5; j++){
//         const coordinate = getRandomLatLng(map);
//         leafletMarker = L.marker(coordinate);
//         leafletMarker.bindPopup("Randomly generated marker in loop " + (i+1) + " at inner loop " + (j+1) + " index " + j);
//         leafletMarker.addTo(groupArray[i]);
//     }
//     groupArray[i].addTo(map);
// }

// console.log(groupArray);

// layer control testing

// const baseLayer = {
//     'Randomized Marker Group 1': groupArray[0]
// }

// const overlays = {
//     'Randomized Marker Group 2': groupArray[1],
//     'Randomized Marker Group 3': groupArray[2]
// }

// L.control.layers(baseLayer, overlays).addTo(map);

const dogParkCategory = 16033;

searchButton.addEventListener('click', function(){
    alert("Hello World");
    const searchValue = document.getElementById("searchValue").value;
    console.log(searchValue);
    loadData(fourSquareURL, dogParkCategory);
});

// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url, category){
    const response = await axios.get(url, {
        headers: {
            // Use capital letters for these. Accept is for (idk)
            Accept: "application/json",
            // Authorization is for using your own API key to access
            Authorization: FOURSQUARE_API_KEY
        },
        "params":{
            ll: sgLatLong,
            category: category,
            limit: 50
        }
    });

    console.log(response.data);
}