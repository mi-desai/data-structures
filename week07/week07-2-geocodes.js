//dependencies

const dotenv = require('dotenv').config({path: '/home/ec2-user/environment/.env'}); // npm install dotenv
var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');

// TAMU api key
const apiKey = process.env.TAMU_KEY;   

//LET IT BE KNOWN - I did a little bit of manual tinkering with the JSON being loaded in - after each zone was complete, I joined each JSON together and then replaced all instances of ][ (i.e. the end of an array for the first zone, the beginning of the array for the second zone) with a simple ',' so that everything would be in one big array and I could feed in all my addresses into the API at the same time. 

let data = JSON.parse(fs.readFileSync('/home/ec2-user/environment/week07/combined.json')); 
let inputs = []; 

//I made the below for loop to iterate through my gigantic combined JSON with everything in it to get ONLY the addresses and clean them up a bit to the inputs variable array. 

for (let i=0; i<data.length; i++) {
    let addresses = data[i].address;
    addresses.replace(/&apos;/,''); 
    addresses.replace(/&amp;/,'');
    inputs.push(addresses); 
}

//The below code was used to test only 10 items at a time to preserve the number of API calls I coudld make. 
//inputs = inputs.slice(0, 10);
// console.log(inputs.length);


//Explanation Block
//async.eachSeries is essentially just a for loop that goes through each element in an array that you feed it. However, there is a major problem with it - it can't keep track of the index that it is on in order to pair the lat/long with a speciic address. 
//The first time I did this, when I saved my new JSON file, I had all the addresses and meetings at the top, and all the lat/longs below it (all in the same order, luckily)
//I realized I needed some way to make sure each address was being paired with its lat/long correctly - which I accomplished using index. Usually in a for loop, I could specify that some new array element should be created at index i, but with async.eachSeries, I had to create this myself. 
//I created the variable index and then for every time I pushed a lat/long pair to the data, it would be matched up so long as index continued to increase by 1 with each callback, which it did. 
//Problem solved!

let index = 0; 

async.eachSeries(inputs, function(value, callback) {
    var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
    //next line takes the street address, splits it by the space, rejoins by %20, which is an ascii key
    apiRequest += 'streetAddress=' + value.split(' ').join('%20');
    //next line is always going to be in a constant city and state
    apiRequest += '&city=New%20York&state=NY&apikey=' + apiKey;
    //the format you will want is json
    apiRequest += '&format=json&version=4.01';
    console.log(apiRequest);

     request(apiRequest, function(err, resp, body) {
         if (err) {throw err;}
        else {
            let tamuGeo = JSON.parse(body);
            data[index].latitude = +tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude; 
            data[index].longitude = +tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude;
            index++;
            console.log(tamuGeo.FeatureMatchingResultType, tamuGeo.TimeTaken); 
        }
    });
    setTimeout(callback, 1000);
}, function() {
    fs.writeFileSync('everything.json', JSON.stringify(data, null, 2));
});
