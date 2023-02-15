
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// Unsure whether to write functions at the top or bottom (bc they are hoisted anyways). Will do bottom for now... used to from Java

// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


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
async function loadData(url, latLong, searchValue){
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