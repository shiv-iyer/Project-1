
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Event Listener for search button: on click
searchButton.addEventListener('click', function(){
    const selectedCategory = document.getElementById("categoryForm").value;
    let searchCategory;
    alert("Category Form value: " + selectedCategory);

    // convert the category form value into functional fourSquare categories
    switch(selectedCategory){
        case 'pet-cafe': searchCategory = 13063;
            break;
        case 'pet-grooming': searchCategory = 11134; 
            break;
        case 'pet-supplies': searchCategory = 17110;
            break;
        case 'dog-parks': searchCategory = 16033;
            break;
        // maybe don't need default? since it is only 1 of 4 options rn
    }

    console.log(searchCategory);
    loadData(fourSquareURL, searchCategory);
});

// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url, searchType){
    console.log("Search category: " + searchType);
    const resultLimit = 25;
    const response = await axios.get(url, {
        headers: {
            // Use capital letters for these headers
            Accept: "application/json",
            // Authorization is for using your own API key to access FourSquare
            Authorization: FOURSQUARE_API_KEY
        },
        // parameters for FourSquare search
        "params":{
            ll: sgLatLong,
            categories: searchType,
            limit: resultLimit
        }
    });

    // make sure queryResults gets logged out successfully first
    const queryResults = response.data;
    console.log(queryResults);

    // next step: translate the data into functional params for marker display
    // get the total amount of search results, and plot as many amount of markers.
    // fourSquare's results is an array of objects. Use Object.keys to get as many keys to know the length
    const searchResultsLength = Object.keys(response.data.results).length;

    const searchGroup = L.layerGroup();
    // traverse through from 0 to the amount of search results
    for (let i = 0; i < searchResultsLength; i++){
        // obtain geocodes: retrieve the coordinates of each result
        const queryGeocodes = queryResults.results[i].geocodes.main;
        console.log(queryGeocodes);
    }

    // // get the amount of total search results; that way, we can plot a marker for each one.
    // // just response.data only has a length of 2, so we need to get through to results to see how many results we have.
    // const searchResultsLength = Object.keys(response.data.results).length;

    // const dogParkGroup = L.layerGroup();
    // // traverse through from 0 to the total amount of search results.
    // for (let i = 0; i < searchResultsLength; i++){
    //     let queryGeocodes = queryResults.results[i].geocodes.main;
    //     console.log(queryGeocodes.latitude);
    //     const queryLatLong = String(queryGeocodes.latitude + " , " + queryGeocodes.longitude);
    //     console.log("For search result #" + (i+1) + ", lat/long: " + queryLatLong);

    //     // next up, add markers
    //     const parkName = queryResults.results[i].name;
    //     const dogParkMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude]);
    //     dogParkMarker.bindPopup("This is a marker displaying " + parkName);
    //     dogParkMarker.addTo(dogParkGroup);

    //     // flyTo the marker on click
    //     dogParkMarker.addEventListener('click', function() {
    //         map.flyTo([queryGeocodes.latitude, queryGeocodes.longitude], 17);
    //     })

    //     // very nice!

    // }
    // dogParkGroup.addTo(map);
}