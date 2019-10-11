#Week 6 Assignment

The assignment was to query both our databases that we created in prior weeks. The AA database is a PostgreSQL database that uses a formal SQL query. The Process Blog/Dear Diary database is stored in an Amazon DynamoDB NoSQL database.

###PostgreSQL Query into AA Database

All SQL queries have to be structured in a very precise format. Much of the query was already supplied by the starter code, which is pasted below: 

```javascript

const { Client } = require('pg');
const cTable = require('console.table');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'aaron';
db_credentials.host = 'dsdemo.c2g7qw1juwkg.us-east-1.rds.amazonaws.com';
db_credentials.database = 'mydb';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query meetings on Monday that start on or after 7:00pm: 
var thisQuery = "SELECT mtgday, mtgtime, mtglocation, mtgaddress, mtgtypes FROM aadata WHERE mtgday = 'Monday' and mtghour >= 7;";

client.query(thisQuery, (err, res) => {
    if (err) {throw err}
    else {
        console.table(res.rows);
        client.end();
    }
}); 
```
I first changed around the dependencies and creation of the PostgreSQL instance using the below modifications to the starter code.

```javascript
const { Client } = require('pg');
const cTable = require('console.table');
const dotenv = require('dotenv').config({path: '/home/ec2-user/environment/.env'});


// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = process.env.AWS_USR;
db_credentials.host = process.env.AWS_END;
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;
```

I then rewrote the actual PostgreSQL query to grab and reorder all my entries in the AA dataset. 

```javascript
var thisQuery = "SELECT address, lat, long FROM aalocations ORDER BY address DESC";
```

These queries made a lot of sense to me and were easy to manipulate and change. 

Will update once Week07 is done. 

Screenshot of results below: 




###DynamoDB Query into Process Blog

Teacher and month number were my partition and sort keys, respectively. To teach myself exactly how these DB queries worked, I reduced the query down to the simplest version that still worked and returned values I wanted, then began to iterate on it again to see if other queries would work (I had a very difficult time getting any other queries to work properly)

Teacher is a superior primary key to "assignment", which was my original primary key when I first created the DB table. Since there are only a few unique teachers and every assignment is unique, specifying teacher returns more assignments than searching for a specific assignment. 

```javascript
var params = {
    TableName : "process-blog3",
    KeyConditionExpression: "teacher = :primary", // the query expression
    ExpressionAttributeValues: { // the query values
        ":primary": {S: "Richard The"},
    }
};
```
Then, I tried to iterate on this simple query by adding on with my sort key (month as a number). 

```javascript
var params = {
    TableName : "process-blog3",
    KeyConditionExpression: "teacher = :primary and #mn = :sort", // the query expression
    ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
        "#mn" : "month", 
    },
    ExpressionAttributeValues: { // the query values
        ":primary": {S: "Richard The"},
        ":sort": {S: "9"}, 
    }
};
```

In this case, I wanted to get the entries/assignments from Richard The in the month of October - this query did not work no matter what I changed about the original table. I believe the original problem is that this data is stored as a "string" type when it should have been stored as a "number" type. So to the query, there is no way to compare two values if you want to ask for assignments between certain month numbers. 

While this satisfies the requirements of the assignment, since I got a result using only the primary key from my first query, I will return to this after additional research into how to structure the query with my sort key. 

See below for screenshot of results: 
