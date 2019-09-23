
//--------------SET-UP--------------------
//loading dependencies into a constant for the environmental variables and the 'pg' library of functions into a client object
const dotenv = require('dotenv').config({path: '/home/ec2-user/environment/.env'}); 
var async = require('async'); 
const { Client } = require('pg');

//creating a credentials object to query our database with
var db_credentials = new Object();
db_credentials.user = process.env.AWS_USR;
db_credentials.host = process.env.AWS_END;
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

//----------------STEP ONE-------------------

//STEP ONE creates a table and console.logs it. This is all from the starter code. 

// let client = new Client(db_credentials);
// client.connect();

// var thisQuery = "CREATE TABLE aalocations (address varchar(100), lat double precision, long double precision);";

// client.query(thisQuery, (err, res) => {
//     console.log(err, res);
//     client.end();
// });


//-----------STEP TWO------------

//I created a new variable called meetings by loading in my .json file from last week using require()

// let meetings = require('./geocodes.json');

// async.eachSeries(meetings, function(value, callback) {
//     const client = new Client(db_credentials);
//     client.connect();

//     I used template literals to be able to write more succinct queries into my DB without needing an escape character. Essentially this allows you to print out the contents of each value without needing to write overly long or complex string queries.
//     Source (template literals): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals 

//     var thisQuery = `INSERT INTO aalocations VALUES ('${value.street}',${value.latitude}, ${value.longitude});`;
//     console.log(thisQuery);
//     client.query(thisQuery, (err, res) => {
//         console.log(err, res);
//         client.end();
//     });
//     setTimeout(callback, 1000); 
// }); 

//----------STEP THREE-----------

//This step will query the database we just created and inserted values into, again, all from the starter code. 

let client = new Client(db_credentials);
    client.connect();

    // Sample SQL statement to query the entire contents of a table: 
    var thisQuery = "SELECT * FROM aalocations;";

    client.query(thisQuery, (err, res) => {
        console.log(err, res.rows);
        client.end();
    });
