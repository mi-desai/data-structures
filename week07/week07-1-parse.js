//importation of dependencies via Node

var fs = require('fs');
var cheerio = require('cheerio');

//Explanation Block
//loading in my zone text files using a process.argv protocol, which allows me to use the command line to specify which text file to perform the script on. 
//I was able to type into my terminal the following command -> node week07-1-parse.js m03 to get the script to run on the m03.txt file. 
//I did this instead of fitting everything into loop for all 10 files, partially to simplify my script but mostly to ensure this script worked for all 10 files with few errors. 

var content = fs.readFileSync(`/home/ec2-user/environment/data/${process.argv[2]}.txt`);

var $ = cheerio.load(content);

var meetingData = [];

//Explanation Block
//Using cheerio to navigate to the correct <tr> tag within the correct <tbody> tag, then finding each <td> tag following a <tr> tag and performing a function on each. 
//It finds three separate td's - the first of which contain the address and name of each specific meeting in the file, the second of which contains all the times ("instances") that the meetings occur.
//The third <td> tag found only has the button to push for getting directions, and is therefore not helpful for the purposes of parsing meetings and times from each text file. 

$('tbody tbody tbody > tr').each(function(i, tr) {
    //creation of meeting object here and creation of a unique ID tag for each meeting - critical for my overall plan for the PostgreSQL database. 
    let meeting = { meetingID: process.argv[2]+i };
    $(tr).find('td').each(function(dataType, td) {
        //Using a switch statement instead of two if statements since I think switch looks a lot cleaner and it is easier to see the flow of logic.
        switch (dataType) {
            case 0: //meetings - name, address, details - calls function parseAaddress, inserting the first <td> tag found as an argument, as well as the meeting object created above. 
                parseAddress($(td), meeting);
                break;
            case 1: //meeting instances - weekday, start, end, special interest - calls function parseInstances, inserting the second <td> tag found as an argument, as well as the meeting object created above. 
                parseInstances($(td), meeting);
                break;
        }
    });
    //once both functions are perormed on the both <td> tags, we push the meeting object to our empty array variable meetingData. 
    meetingData.push(meeting);
    console.log(meetingData);

});

//Explanation Block
//Essentially, all I am doing here is taking each <td> tag that cheerio finds and splitting it into array elements, which I can then manipulate further into distinct properties for the meetings object. 
//The HTML variable contains the td, is trimmed for spaces, and split into an array by line break. Then, using a .map(), I further trim each array element's text. (The text is still pretty messy here even after two trims). 
//This allows the HTML variable array to contain most of what we need from each meeting separated out into its elements. Then it is just a matter of calling each index and performing a bit more cleanup on them to get them to be useable for the meeting object. 
//Splitting and replacing by regex allows us to narrow everything down. The great thing is that we can split further, specify a single index that we want, and then throw out the rest of the array. 
//Despite the fact that I replaced the /&apos;/ regex here, I still had to do it in a later script before I requested geocodes from the API - not sure why that is. 
//I copied John Outwater's .slice(-5) to get the zipcode. 
//Overall, an easy function to wrap your head around!

function parseAddress(td, meeting) {
    let html = td.html().trim().split(/<br>/).map(
        text => text.trim()
    );
    meeting.location = html[0].split(/[<>]/)[2].replace(/&apos;/,'');
    meeting.name = html[1].split(/[<>]/)[2].replace(/&apos;/,'');
    meeting.fulladdress = html[2] + " " + html[3];
    meeting.zipcode = html[3].slice(-5);
    meeting.address = html[2].split(',')[0];
    meeting.details = td.find('.detailsBox').text().trim();
    meeting.city = "New York";
    meeting.state = "NY";
}


//Explanation Block
//This follows the same logic as parseMeetings, but I had to do a LOT more work to get all the meetings and I had to come back to this script multiple times to change it around to the format that I wanted for entry into the database. 
//Instead of explaining this block above the function, I will put comment lines in throughout the function. 

function parseInstances(td, theMeeting) {
    let meetingInstances = [];
    //Below, I am creating a new variable array that that will contain the 2nd <td> tag, split by line breaks, trimmed using a .map(), and filtered for any empty array elements.
    //However, the filter didn't quite work, since I still have array elements that are empty, full or spaces, or filled with extraneous text. This comes into play in the below for loop. 
    let meetingData = td.html().split(/<br>/).map(
        v => v.trim()
    ).filter(
        v => v !== ''
    );
    //Now, because only EVERY OTHER array element contains what I want, and because each of these array element contains different information I want to encode as properties to the meeting object, I contained the rest of the script in this for loop. 
    for (let i = 0; i < meetingData.length; i += 2) {
        let instance = { meetingID: theMeeting.meetingID };
        
        //Each instance of a meeting is distinct from the meeting itself, so we have to create a new instance object, that will be nested within the overall meeting object. 
        //For writing this to my postgreSQL database, this instance.type object was the source of many problems. Because only two out of of a total of 374 meetings had times with NO type associated with each meeting, there was no instance.type added to the associated object.
        //When I did an INSERT calling instance.type object for all values from the JSON I created, it caused the entire instance table to be rejected because two meetings didn't have instance.type in the object!
        //For this error, I went in and manually added the meetings, which may technically be a no-no but it was easier than rewriting this script again. 
        
        instance.type = meetingData[i + 1].replace(/^.*\/b> /, '');
        
        //With each instance broken up by a line break, I can use a regular expression above that uses ^ to start at the beginning of the line, and gets everything using .* until the <b> tag, and replaces it with ''. 
       
        let data = meetingData[i].replace(/\s+/g, " ").trim().split(" ");
        //Using another regular expression to replace all whitespace globally and replacing with a " " and applying a trim() for good measure, and then splitting by the newly created " "
        //Below - this if/else statement goes through the array I've created, checks to see if it has content, then makes sure the text "Special Interest" exists in the element
        //It next adds that element, after satisfying those two conditions, to the instance object, which will be added to the meeting object after cleaning it with the same regular expression used above in line 86. 
        
        if (meetingData[i + 2] !== undefined && meetingData[i + 2].indexOf("Special Interest") !== -1) {
            instance.interest = meetingData[i + 2].replace(/^.*\/b> /, '');
            i++;
        }
        else {
            instance.interest = '';
        }
        
        instance.weekday = data[0].replace(/^.../, "");
        // this regex means at the beginning of the string/line, find the first three characters and then stop. 
        //the first index of data, which is just meetingData[i] always contains the weekday so we can, with certainty write this script and expect instance.weekday will be populated. 
        instance.startTime = data[2].split(/:/).map(
            f => +f
        );
        if (data[3] === "PM" && instance.startTime[0] !== 12) {
            instance.startTime[0] += 12;
        }
        instance.startTime = instance.startTime[0] * 100 + instance.startTime[1];
        //for startTime, I wanted to make sure I was getting a number, not a string. I additionally wanted to reduce the number of properties this object had and decided to transform all my startTime and endTime properties into numbers between 0 and 2400 for military time, to make it easier to compare. 
        //I was able to accomplish this by first transforming the appropriate strings into numbers (first removing the colons using another regex), then using the occurrence of PM to add 12 if necessary.
        //Next, I multiplied my selection by 100 and added it to the startTime object property. 
        
        instance.endTime = data[5].split(/:/).map(
            f => +f
        );
        if (data[6] === "PM" && instance.endTime[0] !== 12) {
            instance.endTime[0] += 12;
        }
        instance.endTime = instance.endTime[0] * 100 + instance.endTime[1];
        meetingInstances.push(instance);
    }
    //For endTime, I did pretty much the exact same thing as for startTime. 
    
    theMeeting.meetingInstances = meetingInstances;
    
    //theMeeting is one of the arguments for the function, we are simply assigning all outputs from the loop to meetingInstances. 
}

fs.writeFileSync(`${process.argv[2]}.json`, JSON.stringify(meetingData, null, 2)); 
