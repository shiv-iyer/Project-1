
const fourSquareURL = "https://api.foursquare.com/v3/places/search";
const FOURSQUARE_API_KEY = "fsq3jMP2VLbUVepHLNvSdnHHmMc7KnQT7vAYp7wRcl+DPvU=";
const sgLatLong = "1.290270,103.851959";

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

const searchButton = document.getElementById("btnSearch");

searchButton.addEventListener('click', function(){
    alert("Hello World");
    const searchValue = document.getElementById("searchValue").value;
    loadData(fourSquareURL, sgLatLong, "pet cafe");
});