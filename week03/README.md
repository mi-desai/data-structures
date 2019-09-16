# Week03 HW Assignment
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_03.md).

### Step 1 - Fixing Last Week's Mistakes, and modifying my input Array

I had to update my solution to Week02's HW before I even started on this assignment, since I realized that extraneous information was present that would otherwise mess up the apiRequest function argument "value". 

Code added to week02.js: 

```javascript
let array = result.replace(/\t/g,'').split('::');
result = '';

array.forEach(
    function(line){
        let len = line.length;
        if (len > 0) {
           let clean = line.substring(0,line.indexOf(',')).trim() + ' NY ' + line.substring(len-5, len) + '\n';
           let leftParen = clean.indexOf('(');
           if (leftParen !== -1) {
               let rightParen = clean.lastIndexOf(')')
               if (rightParen !== -1) {
                   clean = clean.substring(0, leftParen) + clean.substring(rightParen + 1);
               }
           }
           result += clean;
        }
    }
    );
```

This code takes the result of the original function I wrote, redefines it as a variable with the name array, replaces the all the latent tabs in the HTML, and splits it by a string that I added to divide each address ('::'). Then result is redefined as an empty string. The array is given a forEach method with a function I created called line, that takes one argument. It then defines clean, rightParen, and leftParen using indexes of the commas and the parentheses, removing all text within the parentheses and the last five letters from each string by creating substrings of the parts of the addresses that we want to keep. Then clean is passed into result. 

The end result is that the addresses look like this: 

<blockquote>
  122 East 37th Street NY 10016 <br>
  30 East 35th Street NY 10016 <br>
  350 East 56th Street NY 10022 <br>
  619 Lexington Avenue NY 10022 <br>
</blockquote>

However, there were two mistakes with this file that I corrected early on with rawData[0], and .split('\n'). First was that my output4.txt file was structured as an array with a single string entry. That was being passed through to the apiRequest variable, resulting in a huge http address that returned an error. 

So first I had to make sure the first string which contained all of my addresses was selected. I did this with rawData[0]. Then I applied a split by line breaks, which split output4 into multiple indices. This successfully created the entire array. See below: 

```javascript

var rawData = fs.readFileSync('/home/ec2-user/environment/week03/output4.txt').toString().split('/n');

console.log(rawData);

var meetingsData = [];
var addresses = rawData[0].split('\n'); 

console.log(addresses);
```

Oringally, I wanted to use a json file with fs.readFilSync, but this returned an empty array full of "objects." This is likely due to an issue with the Week03 code. To remedy this, I changed the output.txt file to a string, and tried to split by line breaks, but I had to give the same method in my code below. This was the tripping up point for me. I couldn't get the .split() to work without writing it twice. 

### Step 2 - Securing the API Key w/ An Environmental Variable

Per the instructions, I defined a const using an environmental variable to hold my API key. This way, the reference to the variable is not seen in the code. 
```javascript
// TAMU api key
dotenv.config();
const apiKey = process.env.TAMU_KEY;
```
Environmental variables should be used for any sensitive information that should not be displayed to the public - API keys, credit card information, etc. 

### Step 3 - Debugging and Parsing the Returned JSON

```javascript
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
```

With the input array going into addresses in the starter code correctly, I started to run the code. It worked, but returned far more information than I needed, which was just latitude and longitude. 

To see what was going into these functions, I wrote (now commented out) console.log lines to see what a full apiRequest variable looked like, which allowed me to see the API was being called correctly. 

I did the same to parse down the returned JSON beneath the declaration of var tamuGeo above. 

Per each request, it returns one object with index 0, nested twice within "Output Geocodes", for some reason. Then I got the properties latitude and longitude from each request and console logged it to make sure I was getting something that looked like longitude and latitude while I was running the program. 

Finally, I changed around the push() to meetingData to re-return the value of the function (the address), the latitude property, and the longitude property. This allowed the correct address to be matched with the appropriate latitude and longitude. 

I kept the callback timer set to 2 seconds. 

### Step 5 - Structuring the JSON to look better

```javascript
}, function() {
    fs.writeFileSync('geocodes.json', JSON.stringify(meetingsData, null, 4));
    
});
```

The stringify() method can be used to not only specify the data being used, but also the format. I got this from MDN web docs. Stringify has three arguments - the value, the replacer, and a space. If the replacer is set to null, all properties of the each object are included in the JSON string. The space argument is important, because it adds whitespace for readability. I added four, which made the output look like this: 
```javascript
[
    {
        "street": "122 East 37th Street NY 10016",
        "latitude": "40.7483929",
        "longitude": "-73.9787906"
    },
//... etc
```
Which is much more readable. 

### Problems with the Solution

This process depends on the output from Week02. Despite working to remove parantheses and extraneous information, I still needed to do more to the file to make it usable for this code. 

Additionally, the second to last address is missing, even though it pulled through a latitude and longitude for the associated address. I'm not sure what the problem is with that. Will bring it up on Piazza. 



