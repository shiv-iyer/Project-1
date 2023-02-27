
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// Custom Leaflet marker icon for dog parks, it's a paw
const dogParkIcon = L.icon({
    // worry about other variables / options later, first, establish basic functionality for one category
    iconUrl: '/images/pawbase-border.png',
    iconSize: [35, 35]
 });
 
// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// create individual marker cluster groups for each layer to be displayed.

// customize html of the marker cluster display... WIP
// from Marker Cluster documentation
const petCafeLayer = L.markerClusterGroup({
    iconCreateFunction: function(cluster){
        return L.divIcon({html: '<b>' + cluster.getChildCount() + '</b>'});
    }
}).addTo(map);

const petGroomingLayer = L.markerClusterGroup().addTo(map);
const petSuppliesLayer = L.markerClusterGroup().addTo(map);
const dogParksLayer = L.markerClusterGroup().addTo(map);

L.layerGroup()

// controller for layer groups
const layerController = L.control.layers(
    // base layers can be blank
    {},
    // overlays
    {petCafeLayer, petGroomingLayer, petSuppliesLayer, dogParksLayer}
).addTo(map);

// Event Listener for search button: on click
searchButton.addEventListener('click', function(){
    const selectedCategory = document.querySelector("#categoryForm").value;
    let searchCategory;
    //alert("Category Form value: " + selectedCategory);

    // convert the category form value into functional fourSquare categories
    let searchLayer;
    switch(selectedCategory){
        case 'pet-cafe': searchCategory = 13063;
                         searchLayer = petCafeLayer;
            break;
        case 'pet-grooming': searchCategory = 11134; 
                             searchLayer = petGroomingLayer;
            break;
        case 'pet-supplies': searchCategory = 17110;
                            searchLayer = petSuppliesLayer;
            break;
        case 'dog-parks': searchCategory = 16033;
                          searchLayer = dogParksLayer;
            break;
        // maybe don't need default? since it is only 1 of 4 options rn
    }

    console.log(searchCategory);

    // now, retrieve the data from the results form
    const resultLimit = document.getElementById("resultLimitForm").value;

    // type of results is a string
    console.log(typeof resultLimit);

    // if results form is left blank, perform validation and avoid calling any functions
    // can refactor this into a switch later
    if (resultLimit.length == 0) {
        alert("results was left blank!");

        // get results to be NaN to validate that too
        // Number(results) == NaN did not work, so using the isNan() function
        // console.log("if results is NaN" + isNaN(Number(results)));
    } else if (isNaN(Number(resultLimit))){
        alert("You did not input a valid number, please try again!");
        // now, ensure that the user inputted results from 10 to 50 only
    } else if (resultLimit < 10 || resultLimit > 50){
        alert("You need to input a number from 10-50!");
    } else {
        // functional search, pass in all the relevant params!
        console.log("All error checks completed, loading the data");
        loadData(fourSquareURL, searchCategory, searchLayer, resultLimit);
    }

});


// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url, searchType, layerType, resultLimit){
    console.log("Search category: " + searchType);
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
    console.log(searchResultsLength);

    // traverse through from 0 to the amount of search results
    for (let i = 0; i < searchResultsLength; i++){
        // obtain geocodes: retrieve the coordinates of each result
        const queryGeocodes = queryResults.results[i].geocodes.main;
        console.log(queryGeocodes);

        // queryGeocodes returns an object with keys that store latitude and longitude.
        // seeing as Leaflet markers require an array of coords, store as that first, hard code it
        // there has to be an elegant way to make it from an object into an array look into later!!!

        console.log(layerType == dogParksLayer);

       // if layer type = dog parks layer, add custom icon, else normal

       let resultMarker;
       if (layerType == dogParksLayer){
           resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: dogParkIcon});
       } else {
           resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude]);
       }

        resultMarker.bindPopup("This is a marker displaying " + queryResults.results[i].name);

        // add marker to the layer group
        resultMarker.addTo(layerType);
    }
}

// TODO: refactor my functions to be individual (not all part of the loadData function)