# Week05 Assignment

### Step 1: Data Model

The assignment is to create our own unique process blog on a topic of our choice with a unique primary key and potentially a sort key for a NoSQL data table in AWS's DynamoDB. I decided on a denormalized data model which I believe offers a greater degree of flexibility in structuring and changing the data structure as the Process Blog develops and changes, which is easier than a fully normalized DB. See below for my data model sketch: 

### Step 2: Setup

BlogEntry {<br/>
                    ‘Assignment’ : 'AA Mapping Project'<br/>
                    ‘Date’ : 'December 16th, 2019'<br/>
                    ‘Teacher’ : ‘Aaron Hill’<br/>
                    ‘Reading’ : false<br/>
                    ‘Coding’ : true<br/>
                }<br/>

I decided to do assignments in the MSDV I've undertaken so far. <br/>

Table Name: process-blog2 <br/>
Primary Key: assignment <br/>
Datatype of Primary Key: String <br/>
Sort Key: date <br/>
Datatype of Sort Key: String <br/>

### Step 3: DB Creation

In the starter code, I pushed my blogEntries after modifying the arguments of the class constructor and the properties. 

```javascript
var async = require('async'); 
var blogEntries = [];

class BlogEntry {
  constructor(assignment, date, teacher, reading, coding) {
    this.assignment = {}; // Assignment is Primary Key
    this.assignment.S = assignment.toString();
    this.date = {}; // Time Sort Key
    this.date.S = new Date(date).toDateString();
    this.teacher = {};
    this.teacher.S = teacher;
    this.reading = {};
    this.reading.BOOL = reading; 
    this.coding = {};
    this.coding.BOOL = coding; 
    this.month = {};
    this.month.N = new Date(date).getMonth().toString();
  }
}

blogEntries.push(new BlogEntry('Quantitative Visualization', 'September 24, 2019', 'Richard The', false, true));
blogEntries.push(new BlogEntry('Qualitative Visualization', 'October 17, 2019', 'Richard The', false, true));
blogEntries.push(new BlogEntry('AA Mapping Project', 'December 16, 2019', 'Aaron Hill', false, true));
blogEntries.push(new BlogEntry('Right Twice a Day', 'October 2, 2019', 'Christian Swinehart', false, true));
```

### Step 4: Populate DB

This is the step where I spent the majority of my time. Using async, I put the starter code inside of async and caused it loop over eachSeries of the blogEntries array, and set a callback timer for every second, so as not to overshoot the 2 requests per second limitation. 

I put the var declarations inside of the function, but they are still global. One thing I kept doing was renaming my table in DynamoDB, which caused this code to return a HTTP 400 error. When I finally realized that it had to match up, the code worked well. 

```javascript
async.eachSeries(blogEntries, function(entry, callback) {

  var params = {};
  params.Item = entry; 
  params.TableName = "process-blog2";

  dynamodb.putItem(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    });

    setTimeout(callback, 1000); 
      });
```
