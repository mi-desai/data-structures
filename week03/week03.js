// dependencies
var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
const dotenv = require('dotenv'); // npm install dotenv

// TAMU api key
dotenv.config();
const apiKey = process.env.TAMU_KEY;

// geocode addresses
var rawData = fs.readFileSync('/home/ec2-user/environment/week03/output4.txt').toString().split('/n');

console.log(rawData);

var meetingsData = [];
var addresses = rawData[0].split('\n'); 

console.log(addresses);

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
    //next line takes the street address, splits it by the space, rejoins by %20, which is an ascii key
    apiRequest += 'streetAddress=' + value.split(' ').join('%20');
    //next line is always going to be in a constant city and state
    apiRequest += '&city=New%20York&state=NY&apikey=' + apiKey;
    //the format you will want is json
    apiRequest += '&format=json&version=4.01';
//    console.log(apiRequest);

     request(apiRequest, function(err, resp, body) {
         if (err) {throw err;}
        else {
            var tamuGeo = JSON.parse(body);
//            console.log(tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude, tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude);
            meetingsData.push({
                street: value,
                latitude: tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude,
                longitude: tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude,
            });
        }
    });
    setTimeout(callback, 2000);
}, function() {
    fs.writeFileSync('geocodes.json', JSON.stringify(meetingsData, null, 4));
    
});
