
// Initialize the variables

const map = L.map("singaporeMap");
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";
const searchButton = document.getElementById("btnSearch");

// initialize some html elements that will be selected & assigned after dom content loaded
let queryForm;
let radioButtons;
let resultForm;
let updatesForm;

// Custom Leaflet marker icons for each individual category
const petCafeIcon = L.icon({
    // implement a custom icon url for the marker
    iconUrl: '/assets/marker-images/dog-park.png',
    iconSize: [44, 44]
});

const petGroomingIcon = L.icon({
    iconUrl: '/assets/marker-images/pet-grooming.png',
    iconSize: [44, 44]
});

const petSuppliesIcon = L.icon({
    iconUrl: '/assets/marker-images/pet-supplies.png',
    iconSize: [44, 44]
});

const dogParkIcon = L.icon({
    iconUrl: '/assets/marker-images/dog-park.png',
    iconSize: [44, 44]
});

// Load Leaflet Map 
map.setView([1.290270, 103.851959], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// create individual marker cluster groups for each layer to be displayed.

// Customize the html of the marker cluster display...
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

    const selectedCategory = document.querySelector("#categoryForm").value;
    let searchCategory;

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

    // variable for the number of results to show
    let resultLimit;

    // first validate if everything is blank, aka the user inputs nothing
    if (!resultForm.value && checkRadios() == 3){
        // change the value of the updates form to display error messages!
        updatesForm.value = "ERROR: Please try again after selecting the number of results you would like to display!";
    } else if (checkRadios() == 3) {
        if (isNaN(Number(resultForm.value))){
            updatesForm.value = "ERROR: Please try again after inputting a valid number in the custom results field!";
            // now, ensure that the user inputted results from 10 to 50 only
        } else if (resultForm.value < 10 || resultForm.value > 50){
            updatesForm.value = "ERROR: Please try again after inputting a number between 10-50!";
        } else {
            resultLimit = resultForm.value;
        }
    } else {
        // get selected radio button value by iterating through each radio button, finding the checked one!
        radioButtons.forEach(radioButton => {
            if (radioButton.checked)
            resultLimit = radioButton.value;
        });

        // if searchCategory and searchLayer are arrays, user selected all categories, therefore load data 4 times
        if (Array.isArray(searchCategory) && Array.isArray(searchLayer)) {
            // for loop to iterate through all 4 layers and call loadData 4 types
            for (let i=0; i<4; i++) {
                loadData(fourSquareURL, userQuery, searchCategory[i], searchLayer[i], resultLimit);
            }
        }
        else {
            loadData(fourSquareURL, userQuery, searchCategory, searchLayer, resultLimit);
        }
        updatesForm.value = "The map has been successfully updated!";
    }
    }
);

// Event Listener for clear button: on click
document.querySelector("#btnClear").addEventListener('click', function(){
    // possible validation: alert user if map is already clear
    updatesForm.value = "The map has been successfully cleared!";
    clearLayers();
});

// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url, userQuery, searchType, layerType, resultLimit){
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

    // declare marker type, will be assigned later to determine the category
    let markerType;

    // next step: translate the data into functional params for marker display
    // get the total amount of search results, and plot as many amount of markers.
    // fourSquare's results is an array of objects. Use Object.keys to get as many keys to know the length
    const searchResultsLength = Object.keys(response.data.results).length;

    if (searchResultsLength == 0){
        updatesForm.value = "No search results were found, please try again!";
    } else {
        // traverse through from 0 to the amount of search results
        for (let i = 0; i < searchResultsLength; i++){ 
            // obtain geocodes: retrieve the coordinates of each result
            const queryGeocodes = queryResults.results[i].geocodes.main;
    
            // queryGeocodes returns an object with keys that store latitude and longitude.
            // seeing as Leaflet markers require an array of coords, store as that first, hard code it
            // there has to be an elegant way to make it from an object into an array look into later!!!
    
           let resultMarker;
    
           // depending on the layer type, assign the custom marker icon and markerType text 
           // could possibly be refactored into a switch?
           if (layerType == petCafeLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: petCafeIcon});
            markerType = "Pet Café";
           } else if (layerType == petGroomingLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: petGroomingIcon});
            markerType = "Pet Grooming Service";
           } else if (layerType == petSuppliesLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: petSuppliesIcon});
            markerType = "Pet Supplies Store";
           } else if (layerType == dogParksLayer){
            resultMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude], {icon: dogParkIcon});
            markerType = "Dog Park";
           }
           
           // retrieve results from API query
           const name = queryResults.results[i].name;
           const formattedAddress = queryResults.results[i].location.formatted_address;

           // create <li> elements for the search results list
           const liElement = document.createElement('li');
           liElement.classList.add("liElements");
           liElement.innerHTML = name;
           document.querySelector('#searchResultsList').appendChild(liElement);
           liElement.addEventListener('click', () => {
            // close the off canvas container
            document.querySelector("#offCanvasContainer").classList.toggle("show");
            // FOR REF: the bootstrap off canvas creates a div that has the class modal-backdrop


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
           cardBody.setAttribute("class", "marker-card-main");
           // now, card title
           const cardTitle = document.createElement("h5");
           cardTitle.setAttribute("class", "card-title");
           // testing out both ways to add to class list: classList.add and setAttribute for class
           cardTitle.classList.add("marker-card-items");
           cardTitle.innerText = name;

           // category of the location
           const categoryText = document.createElement("p");
           categoryText.setAttribute("class", "card-text");
           categoryText.setAttribute("class", "marker-card-items");
           categoryText.innerText = "Type: " + markerType;

           // now, child card text
           const addressText = document.createElement("p");
           addressText.setAttribute("class", "card-text");
           addressText.setAttribute("class", "marker-card-items");
           addressText.innerText = "Address: " + formattedAddress;
    
           // possible todo: secondary "Type: Pet Cafe" for whatever category it is
           
           // append the relevant children to the parents
           cardBody.appendChild(cardTitle);
           //cardBody.appendChild(cardImageContainer);
           cardBody.appendChild(categoryText);
           cardBody.appendChild(addressText);
           cardContainer.appendChild(cardBody);
    
           // bind the card as a popup to the marker
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
    updatesForm = document.getElementById("mapUpdatesForm");

    // Clear radio buttons if an input is detected on the result form; avoid users dual-submitting results options
    resultForm.addEventListener('input', function(){
        if (checkRadios() < 3){
            radioButtons.forEach(radioButton => {
                if (radioButton.checked)
                    radioButton.checked = false;
            });
        }
    });
});

function checkRadios(){
    // initialize a variable for the number of unchecked radio buttons
    let numUncheckedRadios = 0;
    // iterate through the radio buttons, and increment the numUncheckedRadios if unchecked radios are found
    radioButtons.forEach(radioButton => {
        if (!radioButton.checked)
            numUncheckedRadios++;
    });
    return numUncheckedRadios;
}

// Event listener for the email form submission
document.querySelector("#emailSubmitBtn").addEventListener('click', function(){
    const emailForm = document.querySelector("#emailForm");
    const emailInput = emailForm.value;
    // basic validation for now: check if user input includes '@' and '.' to validate the email address.
    // and minimum length of the email address, since .com is 4 characters and @<domainName> would be minimum 5 so min length 9
    // further possible validation steps would involve RegEx, but it is very difficult to understand...

    // change these alerts...
    if (!emailForm.value){
        alert("You left the email address field blank, please try again!");
    }
    else if (!emailInput.includes("@") || !emailInput.includes(".") || emailInput.length < 9){
        alert("You submitted an invalid email address, please try again!");
    } else {
        alert("Successful submission! Please check your inbox for updates :)");
        // clear form once submission is successful!
        emailForm.value = "";
    }
});

// Clear all layers from the marker cluster groups.
function clearLayers(){
    petCafeLayer.clearLayers();
    petGroomingLayer.clearLayers();
    petSuppliesLayer.clearLayers();
    dogParksLayer.clearLayers();
}