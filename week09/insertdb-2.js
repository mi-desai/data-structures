let request = require('request');
const { Client } = require('pg');
const dotenv = require('dotenv').config({path: '/home/ec2-user/environment/.env'});

// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var particle_variable = 'tempsensor';
var device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + particle_variable + '?access_token=' + access_token;

//AWRDS Access
var db_credentials = new Object();
db_credentials.user = process.env.AWS_USR;
db_credentials.host = process.env.AWS_END;
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

var index = 0; 
var input = {}; 

var getAndWriteData = function() {
        request(device_url, function(error, response, body) {
        
        // Store sensor value(s) in an object
        var thisRequest = JSON.parse(body);
        var rawTimeStamp = thisRequest.coreInfo.last_heard.split('T'); 
        var splitDate = rawTimeStamp[0].split(/-/);
        input.eventNum = index; 
        input.date = rawTimeStamp[0]; 
        input.year = parseInt(splitDate[0]);
        input.month = parseInt(splitDate[1]);
        input.day = parseInt(splitDate[2]);
        input.hour = parseInt(rawTimeStamp[1].slice(0, 2));
        input.minute = parseInt(rawTimeStamp[1].slice(3, 5));
        input.temperature = parseFloat(thisRequest.result); 
        index++; 
        console.log(input); 
        
        if (error) {
            console.log(error); 
        }
        
                // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table
        var thisQuery = "INSERT INTO sensorDataTwo VALUES (" + input.eventNum + ", E'" + input.date + "', " + input.year + ", " + input.month + ", " + input.day + ", " + input.hour + ", " + input.minute + ", " + input.temperature + ", CURRENT_TIMESTAMP);";
        console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    });
}; 

// getAndWriteData(); 

// write a new row of sensor data every five minutes
setInterval(getAndWriteData, 300000);
