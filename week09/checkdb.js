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

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statements for checking your work: 
var thisQuery = "SELECT * FROM sensorDataTwo;"; // print all values
// var secondQuery = "SELECT COUNT (*) FROM sensorData;"; // print the number of rows
// var thirdQuery = "SELECT temperature, COUNT (*) FROM sensorData;"; // print the number of rows for each sensorValue

client.query(thisQuery, (err, res) => {
    if (err) {
       throw err; 
    }
    else {
    console.table(res.rows);
    }
    client.end(); 
});

// client.query(secondQuery, (err, res) => {
//     if (err) {throw err}
//     else {
//     console.table(res.rows);
//     }
// });

// client.query(thirdQuery, (err, res) => {
//     if (err) {throw err}
//     else {
//     console.table(res.rows);
//     }
//     client.end();
// });
