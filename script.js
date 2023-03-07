
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

const test = 1;

// initialize some variables that will be assigned after dom content loaded
let queryForm;
let radioButtons;
let resultForm;

// Custom Leaflet marker icons for each individual category
const petCafeIcon = L.icon({
    // worry about other variables / options later, first, establish basic functionality for one category
    iconUrl: '/images/dog-park.png',
    iconSize: [44, 44]
});

const petGroomingIcon = L.icon({
    // worry about other variables / options later, first, establish basic functionality for one category
    iconUrl: '/images/pet-grooming.png',
    iconSize: [44, 44]
});

const petSuppliesIcon = L.icon({
    // worry about other variables / options later, first, establish basic functionality for one category
    iconUrl: '/images/pet-supplies.png',
    iconSize: [44, 44]
});

const dogParkIcon = L.icon({
    // worry about other variables / options later, first, establish basic functionality for one category
    iconUrl: '/images/dog-park.png',
    iconSize: [44, 44]
});

// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// create individual marker cluster groups for each layer to be displayed.

// customize html of the marker cluster display... WIP
// from Marker Cluster documentation. style the div so that 
// className of the icon will be dummy so that it overrides Leaflet's default marker cluster icon class, which has a white background
const petCafeLayer = L.markerClusterGroup({
    iconCreateFunction: function(cluster){
        return L.divIcon({html: '<div class="petCafeDot">' + cluster.getChildCount() + '</div>', className:'dummy'});
    }
}).addTo(map);

const petGroomingLayer = L.markerClusterGroup({
    iconCreateFunction: function(cluster){
        return L.divIcon({html: '<div class="petGroomingDot">' + cluster.getChildCount() + '</div>', className:'dummy'});
    }
}).addTo(map);

const petSuppliesLayer = L.markerClusterGroup({
    iconCreateFunction: function(cluster){
        return L.divIcon({html: '<div class="petSuppliesDot">' + cluster.getChildCount() + '</div>', className:'dummy'});
    }
}).addTo(map);

const dogParksLayer = L.markerClusterGroup({
    iconCreateFunction: function(cluster){
        return L.divIcon({html: '<div class="dogParkDot">' + cluster.getChildCount() + '</div>', className:'dummy'});
    }
}).addTo(map);

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

    // remove existing search results if any
    document.querySelector('#searchResultsList').innerHTML = '';

    // clear marker layers
    clearLayers();

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
        case 'all': searchCategory = [13063, 11134, 17110, 16033];
                    searchLayer = [petCafeLayer, petGroomingLayer, petSuppliesLayer, dogParksLayer];
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
        // switch to get selected radio button, implement later
        resultLimit = 25;
        if (Array.isArray(searchCategory) && Array.isArray(searchLayer)) {
            // for loop to iterate through all 4 layers and call loadData 4 types
            for (let i=0; i<4; i++) {
                loadData(fourSquareURL, userQuery, searchCategory[i], searchLayer[i], resultLimit);
            }
        }
        else {
            loadData(fourSquareURL, userQuery, searchCategory, searchLayer, resultLimit);
        }
    }

    // now, retrieve the data from the results form

    // type of results is a string
    console.log("Result limit: " + resultLimit);

    // if results form is left blank, perform validation and avoid calling any functions
    // can refactor this into a switch later
    }

);

// Event Listener for clear button: on click
document.querySelector("#btnClear").addEventListener('click', function(){
    console.log("Clear button was clicked!");
    clearLayers();
});


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
           if (layerType == petCafeLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: petCafeIcon});
           } else if (layerType == petGroomingLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: petGroomingIcon});
           } else if (layerType == petSuppliesLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: petSuppliesIcon});
           } else if (layerType == dogParksLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: dogParkIcon});
           }
           /*if (layerType == dogParksLayer){
               resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: dogParkIcon});
           } else if (layerType =={
               resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude]);
           }*/
           
           // retrieve results from API query
           const name = queryResults.results[i].name;
           const formattedAddress = queryResults.results[i].location.formatted_address;

           // create <li> elements
           const liElement = document.createElement('li');
           liElement.classList.add("liElements");
           liElement.innerHTML = name;
           document.querySelector('#searchResultsList').appendChild(liElement);
           liElement.addEventListener('click', () => {
            // close the off canvas container
            document.querySelector("#offCanvasContainer").classList.toggle("show");
            // FUTURE REF: the bootstrap off canvas creates a div that has the class modal-backdrop whatever


            map.flyTo([queryGeocodes.latitude, queryGeocodes.longitude], 17);
            // if the map is too zoomed out, the marker isn't there, so the marker cluster isn't opened into a marker yet
            // so zoomToShowLayer zooms in to the specified marker of the marker cluster, so that it's visible on the map
            // optional: delay to make the animation smoother
            // just depends on how far zoomed in you are
            layerType.zoomToShowLayer(resultMarker, function(){
                resultMarker.openPopup();
            })
           })
    
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

function createMarkers(){
    // parameters to be passed in:
    // - search results length
    // - 
}

/*function createMarkerCard(){
    return;
}*/

function clearLayers(){
    petCafeLayer.clearLayers();
    petGroomingLayer.clearLayers();
    petSuppliesLayer.clearLayers();
    dogParksLayer.clearLayers();
}

// TODO: refactor my functions to be individual (not all part of the loadData function)

