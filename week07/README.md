# Week07 Assignment - The Big One - Putting all AA Data together

Since this assignment is so expansive, I put a ton of my documentation into comment lines in the code itself. In this file, I will offer only a general explanation of how I did this. 

I would highly encourage anybody looking through this assignment to look at the code I submitted as I painstakingly went through almost every line and added commentary to what I was doing. 

### Assignment

The assignment was to retrieve the rest of the AA data from the 10 txt files I created in week01, query the API to retrieve longitude and latitude information, and then write the entire dataset to our PostgreSQL database. 

### Overall Process

I separated each process into its own script - originally trying to use await and promise, then trying to use async, and then deciding on the separate scripts idea. The asynchronicity of JavaScript is pretty unforgiving. 

#### Parse

The process starts with week07-1-parse.js, then goes to week07-2-geocodes.js, then finally to week07-3-dbinsertion.js. Will be referring to these as Parse, Geocodes, and DB-Insertion respectively. 

Parse used cheerio to break everything out into meeting objects and instance objects respectively. The idea was that each meeting has its own address, name, lat/long, city, state. Each instance has its own start time, end time, type, and special interest. Originally, when I went through this the first time, I was not recording the number of meetings or the zone in either the meeting or instance object. I realized after racing through to my DB-Insertion that this would be a huge problem since the only unique entry (and it wasn't unique usually) would be address or name. So I added a meetingID to each object that was composed of the text file name (m01 through m10) followed by the count of the meeting I found. This way, each meeting would share a unique meetingID with each instance of that meeting. This would also provide me with a unique primary key for the PostgreSQL database that would make queries much easier (or even possible).

At this stage I used another script to join together all each zone json containing all the meeting and instance information for that zone, and non-programmatically, I used a replace aLL in the AWS console to find all ][ (endings of arrays followed by beginnings of arrays) and replaced them with commas so that everythign would be in one big array. 


#### Geocodes
Then I moved on to Geocodes. I noticed there were 374 addresses in total in my JSON. Because I had a large number of API calls remaining, I did not try to preprocess each address for duplicates and instead loaded them all in. In my first iteration of this script I had an issue with my lat/longs being added to the end of my JSON, not nested within the meeting object. To circumvent this, I was able to create an index (much like in a for loop) to make sure each lat/long pair was modifying the index of each address it was receiving, which kept everything in the correct order. Overall, this was the easiest step. 


#### DB-Insertion
After this, I moved on to DB-Insertion. I wanted to establish two tables, with the instance table referencing the primary key of the meeting table. I had to create and drop tables multiple times since I never made the character count for string entries large enough until I looked into proper SQL database management for strings and realized 256 was a number that would make sense both for ensuring a physical memory storage limit for each entry was not exceeded, and for getting all of my entries with long strings into the table. 

I really ran into problems with INSERT-ing information into each table. This is where I encountered the vast majority of my problems that required me to go back to my first two scripts and rerun them multiple times.

There were two problems here that caused both INSERT's to have problems. 

For meetings, I only had 348 entry rows even though there were 374 total addresses in my JSON I was feeding in. I ran a query to return all meetingID's that were written to the DB and compared them to all the meetingID's from my JSON and found the ones that were missing and then spent a lot of time comparing them and researching the problem. I then realized it was because there was an apostrophe for all groups that contained "Men's" or "Women's" groups, and the INSERT was reading these apostrophes as the end of the query, which means it would throw an error for all of those. I replaced all apostrophes and this solved the problem!

For instances, my INSERT was rejected many times, saying it can't read the property of "undefined." There were two problems to solve here. The first was that in my preprocessing prior to the insert, all of my instance objects were still nested in my array I was feeding in as "arrays of arrays", meaning each array element had an array within it, composed of all instances associated with that meeting. I was able to rather easily solve this by using a spread operator (...variablename) - god thing I've decided to become an expert on regular expressions and techniques to deal with those! The second problem with INSERT for instances was that the objects were irregular. I noticed the INSERT was working when I removed a single value from the query, but not for the others - value.type - I went back and counted and realized two of my instance objects were missing a type! Since all fields were inconistent, PostgreSQL was rejecting the INSERT. 

After going back to my Parse script and looking at why these instances didn't have a type, I noticed it was because two of these meetings did not have any text following the start time or end time, which is where meeting type (BB = Big Book, B = Beginner) would usually go. My Parse script was only writing to instance.type if it had something to work with after the end time, so those properties weren't added. I decided to add these manually to my json with empty entries, but I was also able to solve this problem by adding an else {} to my if statement that looked for meeting type. 

Those problems took me the longest to debug and understand, but once they were done, I was able to INSERT and query as much as I wanted. 

### DB Outputs




### A Disclaimer on Doing Three Small Jobs "Manually" in the case of major errors I couldn't fix programmatically

There were three things in total that I did "non-programmatically" which I want to detail here for transparency. 

Number One: I joined all the separate zone JSON's together programmatically, but did a "Replace ALL" in the AWS console for all instances of ][ with , to make everything into one big array. 

Number Two: When debugging why all my meetingID's were not writing to the DB, I replaced all apostrophes using another "Replace All" in AWS. 

Number Three: I added a blank 'type' property to two instances where there was no 'type' property to make sure every instance object was consistent. 
