# Week04 HW Assignment

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04.md).

### Step 1 - Environmental Variables Setup

```javascript
const dotenv = require('dotenv').config({path: '/home/ec2-user/environment/.env'});

// if (dotenv.error) {
//   throw dotenv.error
// }
 
// console.log(dotenv.parsed);

var async = require('async'); 
const { Client } = require('pg');

var db_credentials = new Object();
db_credentials.user = process.env.AWS_USR;
db_credentials.host = process.env.AWS_END;
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

```

I set up a dotenv with a constant path towards one file location, to prevent having to make a new .env file every time I wrote new code with environmental variables. To test to see if the dotenv file was being picked up, I used code to test for an error and then commented it out. I realized doing a .config() with the path name was possible in the same line as declaring the constant. 

Next, I made sure all sensitive information was protected behind environmental variables, including my username, endpoint for the database, and of course, the password. 

### Step 2 - Creating a Table in the database

```javascript

//-----------------STEP ONE-------------------

let client = new Client(db_credentials);
client.connect();

var thisQuery = "CREATE TABLE aalocations (address varchar(100), lat double precision, long double precision);";

client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});

```

This is directly from the starter code. Without the .config() on the dotenv constant we created, the "Client" object has no reference to pieces of information needed to validate access to the database. Once the dotenv was properly set up, this code ran without any changes.

### Step 3 - Populating the Database

```javascript
//-----------STEP TWO------------

let meetings = require('../week03/geocodes.json');

async.eachSeries(meetings, function(value, callback) {
    const client = new Client(db_credentials);
    client.connect();
     var thisQuery = "INSERT INTO aalocations VALUES (E'" + value.street + "', " + value.latitude + ", " + value.longitude + ");";
// var thisQuery = `INSERT INTO aalocations VALUES ('${value.street}',${value.latitude}, ${value.longitude});`;
    //creating a new row in our SQL table
    //remember E means escape character
    console.log(thisQuery);
    client.query(thisQuery, (err, res) => {
        console.log(err, res);
        client.end();
    });
    setTimeout(callback, 1000); 
}); 
'''

To load in the data from last week that I put throw the TAMU API, I loaded the .json file with the address, longitude, and latitude using require(). 

I also changed around the variable thisQuery to use template literals. 

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals 

Template literals allows for strings to be written in "cleaner" ways using the notation ${expression or function to call} and concatenating this expression with strings. I thought this would be a cleaner way to write queries to our database, since we can avoid using the 'E' for escape notation, which I always find very confusing. 

Nothing else has been changed from this code. 

### Step 4 - Querying the Database

'''javascript
// ----------STEP THREE----------
var client = new Client(db_credentials);
    client.connect();

    // Sample SQL statement to query the entire contents of a table: 
    var thisQuery = "SELECT * FROM aalocations;";

    client.query(thisQuery, (err, res) => {
        console.log(err, res.rows);
        client.end();
    });
```

This code was run after the other two steps. I queried it and it contained the entries as they existed in my JSON file!

### Problems with the Solution

The main problem is that all of these cannot be run simultaneously. Because of the somewhat arbitrary separation, I am declaring many variables twice, which would throw an error if I tried to run the code by itself. Additionally, my database lacks the time and other meeting details currently, making it a bit incomplete. 
