
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// initialize some variables that will be assigned after dom content loaded
let queryForm;
let radioButtons;
let resultForm;

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

    const userQuery = queryForm.value;
    console.log("User query: " + userQuery);

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


    // select all of the radio buttons

    let resultLimit;
    

    // first if everything is blank
    if (!resultForm.value && checkRadios() == 3){
        alert("Please select the number of results you would like to display!");
    } else if (checkRadios() == 3) {
        if (isNaN(Number(resultForm.value))){
            alert("Your custom results input was not a valid number, please try again!");
            // now, ensure that the user inputted results from 10 to 50 only
        } else if (resultForm.value < 10 || resultForm.value > 50){
            alert("You need to input a number from 10-50!");
        } else {
            resultLimit = resultForm.value;
        }
    } else {
        // switch to get selected radio button
        resultLimit = 25;
        loadData(fourSquareURL, userQuery, searchCategory, searchLayer, resultLimit);
    }

    // now, retrieve the data from the results form

    // type of results is a string
    console.log("Result limit: " + resultLimit);

    // if results form is left blank, perform validation and avoid calling any functions
    // can refactor this into a switch later
    }

);


// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url, userQuery, searchType, layerType, resultLimit){
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
            query: userQuery,
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

    if (searchResultsLength == 0){
        alert("No search results found!");
    } else {
        // traverse through from 0 to the amount of search results
        for (let i = 0; i < searchResultsLength; i++){
            // obtain geocodes: retrieve the coordinates of each result
            const queryGeocodes = queryResults.results[i].geocodes.main;
    
            // queryGeocodes returns an object with keys that store latitude and longitude.
            // seeing as Leaflet markers require an array of coords, store as that first, hard code it
            // there has to be an elegant way to make it from an object into an array look into later!!!
    
            console.log(layerType == dogParksLayer);
    
           // if layer type = dog parks layer, add custom icon, else normal
    
           let resultMarker;
    
           // later, can do a switch on layerType
           if (layerType == dogParksLayer){
               resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: dogParkIcon});
           } else {
               resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude]);
           }
           
           // retrieve results from API query
           const name = queryResults.results[i].name;
           const formattedAddress = queryResults.results[i].location.formatted_address;
    
           // create the card, first container
           const cardContainer = document.createElement("div");
           cardContainer.setAttribute("class", "card");
           // next, card body
           const cardBody = document.createElement("div");
           cardBody.setAttribute("class", "card-body");
           // now, card title
           const cardTitle = document.createElement("h5");
           cardTitle.setAttribute("class", "card-title");
           cardTitle.innerText = name;
    
           // now, child card text
           const cardText = document.createElement("p");
           cardText.setAttribute("class", "card-text");
           cardText.innerText = formattedAddress;
    
           // possible todo: secondary "Type: Pet Cafe" for whatever category it is
           // image testing
           let imageUrl = queryResults.results[i].categories[0].icon.prefix;
           const imageSuffix = ".png";
           imageUrl += imageSuffix;
           console.log("image url: " + imageUrl);
           
           // append stuff
           cardBody.appendChild(cardTitle);
           cardBody.appendChild(cardText);
           cardContainer.appendChild(cardBody);
    
           resultMarker.bindPopup(cardContainer);
            //resultMarker.bindPopup("This is a marker displaying " + queryResults.results[i].name);
    
            // add event listener to fly to marker on click
            resultMarker.addEventListener('click', function(){
                map.flyTo([queryGeocodes.latitude, queryGeocodes.longitude], 17);
            });
    
            // add marker to the layer group
            resultMarker.addTo(layerType);
        }
    }
}

window.addEventListener("DOMContentLoaded", function(){
    queryForm = document.getElementById("queryForm");
    radioButtons = document.querySelectorAll(".radios");
    resultForm = document.getElementById("resultLimitForm");
    console.log(queryForm);
    console.log(resultForm);

    resultForm.addEventListener('input', function(){
        console.log("hi");
        if (checkRadios() < 3){
            radioButtons.forEach(radioButton => {
                if (radioButton.checked)
                    radioButton.checked = false;
            });
        }
    });
});

function checkRadios(){
    let numUncheckedRadios = 0;
    radioButtons.forEach(radioButton => {
        if (!radioButton.checked)
            numUncheckedRadios++;
    });
    console.log("Check radios was reached");
    return numUncheckedRadios;
}

/*function createMarkerCard(){
    return;
}*/

// TODO: refactor my functions to be individual (not all part of the loadData function)