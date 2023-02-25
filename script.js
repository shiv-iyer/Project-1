
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

const fourSquareCategories = {
    petcafe: 11134,
    petgrooming: 11134,
    petsupplies: 17110,
    dogpark: 16033
}

const dogParkCategory = 16033;
const petCafeCategory = 13063;

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

    //loadData(fourSquareURL, selectedCategory);



    //loadData(fourSquareURL, petCafeCategory);


    // haikal geolocation: basically just getting the user's current location
    // first time: they will ask you
    // first step: map.locate
    // second step:
    // empty string for current location first
    // currentL = "";
    // // map.locate sends you to the user's current location
    // map.locate({  setView: true, maxZoom: 16  });
    // // on location found is a leaflet function, gets from event e
    // function onLocationFound(e){
    //     // extract the data from e, e is an object with latlng inside
    //     currentL += e.latlng.lat + "," + e.latlng.lng;
    //     const marker = L.marker([e.latlng], {icon: markerIcon}).addTo(map);
    //     console.log(currentL);
    // }

    // // this just 
    // map.on('locationfound', onLocationFound);


    // map.locate({setView: true, maxZoom: 16});

    // function onLocationFound(e) {
    //     var radius = e.accuracy;
    
    //     L.marker(e.latlng).addTo(map)
    //         .bindPopup("You are within " + radius + " meters from this point").openPopup();
    
    //     L.circle(e.latlng, radius).addTo(map);
    // }
    
    // map.on('locationfound', onLocationFound);

    // console.log("reached after map.locate");

});

// dropdown: event listener is change, getting the value of the dropdown
// 


// async function to load the data from axios
// Quotations are optional for the key names. They are just so we know they are strings
// add back: latLong and searchValue in the params
async function loadData(url, searchType){
    console.log(searchType);
    const resultLimit = 25;
    const response = await axios.get(url, {
        headers: {
            // Use capital letters for these. Accept is for (idk)
            Accept: "application/json",
            // Authorization is for using your own API key to access
            Authorization: FOURSQUARE_API_KEY
        },
        "params":{
            ll: sgLatLong,
            categories: searchType,
            limit: resultLimit
        }
    });
    // next step: translate the data into readable params
    const queryResults = response.data;
    console.log(queryResults);

    // get the amount of total search results; that way, we can plot a marker for each one.
    // just response.data only has a length of 2, so we need to get through to results to see how many results we have.
    const searchResultsLength = Object.keys(response.data.results).length;

    const dogParkGroup = L.layerGroup();
    // traverse through from 0 to the total amount of search results.
    for (let i = 0; i < searchResultsLength; i++){
        let queryGeocodes = queryResults.results[i].geocodes.main;
        console.log(queryGeocodes.latitude);
        const queryLatLong = String(queryGeocodes.latitude + " , " + queryGeocodes.longitude);
        console.log("For search result #" + (i+1) + ", lat/long: " + queryLatLong);

        // next up, add markers
        const parkName = queryResults.results[i].name;
        const dogParkMarker = L.marker([queryGeocodes.latitude, queryGeocodes.longitude]);
        dogParkMarker.bindPopup("This is a marker displaying " + parkName);
        dogParkMarker.addTo(dogParkGroup);

        // flyTo the marker on click
        dogParkMarker.addEventListener('click', function() {
            map.flyTo([queryGeocodes.latitude, queryGeocodes.longitude], 17);
        })

        // very nice!

    }

    dogParkGroup.addTo(map);

}