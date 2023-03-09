// https://dog-facts-api.herokuapp.com/api/v1/resources/dogs/all
const dogFactsURL = "http://dog-api.kinduff.com/api/facts?number=5";

window.addEventListener("DOMContentLoaded", function(){
    const dogFactForm1 = document.getElementById("dogQuote1");
    const refreshButton1 = document.getElementById("dogBtn1");
    let dogFactForm2;
    let catFactForm1;
    let catFactForm2;
    

    refreshButton1.addEventListener('click', function(){
        console.log(dogFactForm1);
        console.log(refreshButton1);
    })
});