const { Client } = require('pg');
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

// Sample SQL statement to create a table: 
// var thisQuery = "DROP TABLE sensorData; CREATE TABLE sensorData (eventNum INT PRIMARY KEY, date varchar(100), year INT, month INT, day INT, hour INT, minute INT, temperature FLOAT, time TIMESTAMPZ);";
var thisQuery = "DROP TABLE sensorDataTwo; CREATE TABLE sensorDataTwo (eventNum INT PRIMARY KEY, date varchar(100), year INT, month INT, day INT, hour INT, minute INT, temperature FLOAT, rightTime TIMESTAMPTZ);";

client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});
