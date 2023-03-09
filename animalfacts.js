// https://dog-facts-api.herokuapp.com/api/v1/resources/dogs/all
// const dogFactsURL = "http://dog-api.kinduff.com/api/facts?number=5";
const dogImagesURL = "https://random.dog/woof.json";



window.addEventListener("DOMContentLoaded", function(){
    const refreshButton1 = document.getElementById("dogBtn1");
    const dogImageContainer1 = document.getElementById("dogImg1");
    const refreshButton2 = document.getElementById("dogBtn2");
    const dogImageContainer2 = document.getElementById("dogImg2");

    refreshButton1.addEventListener('click', async function(){
        if(dogImageContainer1.innerHTML){
            dogImageContainer1.innerHTML = "";
        }
        const loadedImage = await loadDogImage(dogImagesURL);
        const image = document.createElement("img");
        image.src = loadedImage;
        dogImageContainer1.appendChild(image);
        console.log(image.src);

    })

    refreshButton2.addEventListener('click', async function(){
        if(dogImageContainer2.innerHTML){
            dogImageContainer2.innerHTML = "";
        }
        const loadedImage = await loadDogImage(dogImagesURL);
        const image = document.createElement("img");
        image.src = loadedImage;
        dogImageContainer2.appendChild(image);
        console.log(image.src);

    })
});

async function loadDogImage(URL){
    let response = await axios.get(URL);
    let imageUrl = response.data.url;
    console.log(imageUrl);
    console.log(imageUrl.split("."));
    let fileFormat = false;
    while (!fileFormat){
        response = await axios.get(URL);
        imageUrl = response.data.url;
        urlComponents = imageUrl.split(".");
        if (urlComponents[2] = "jpg"){
            fileFormat = true;
        }
    }
    console.log("final image url: " + imageUrl);
    console.log("Reached end of while");

    return imageUrl;
}

// limitation: api mp4