//Dependency imports

const express = require('express'), app = express();
const bodyParser = require('body-parser');
const path = require('path');
let dir = __dirname; 
const dotenv = require('dotenv').config({ path: '/home/ec2-user/environment/.env' });
const port = 8080; 
const { Client } = require('pg');
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";
var dynamodb = new AWS.DynamoDB();

//Express set-up

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(dir, '/public')));
app.use('/img', express.static(path.join(dir, 'public/img')));
app.use('/js', express.static(path.join(dir, 'public/js')));
app.use('/css', express.static(path.join(dir, 'public/css')));
app.set('views', path.join(dir, 'public/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




//DynamoDB Query

var params = {
    TableName : "process-blog3",
    KeyConditionExpression: "teacher = :primary", // the query expression
    ExpressionAttributeValues: { // the query values
        ":primary": {S: "Richard The"},
    }
};




//Setup Varaiables

let aaoutput = [];
let sensorOutput = []; 




//Index Page

app.get('/', function(req, res) {
    res.render('index', {xyz: 'hello!'});
});






//AA Map Page

app.get('/getaadata', function(req, res) {
    var db_credentials = new Object();
    db_credentials.user = process.env.AWS_USR;
    db_credentials.host = process.env.AWS_END;
    db_credentials.database = 'aa';
    db_credentials.password = process.env.AWSRDS_PW;
    db_credentials.port = 5432;

    var client = new Client(db_credentials);
    client.connect();

    var thisQuery = "SELECT name, zipcode, latitude, longitude FROM meetings WHERE zipcode = '10128' ORDER BY address DESC";

    client.query(thisQuery, (err, response) => {
        console.log(response.rows); 
        console.log(err);
        if (err) {
            res.status(500).json(err);
            client.end(); 
        }
        res.json(response.rows);
        client.end();
    });
});

app.get('/aa', function(req, res) {
    res.render('aa', {data: 'success!'});
});









app.get('/process.html', function(req, res) {
    var something = ''; 
    dynamodb.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        }
        else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                console.log("***** ***** ***** ***** ***** \n", item);
                something += item.teacher.S; 
            });
        res.send(something);

        }
    });
});
















app.get('/sensor.html', function(req, res) {
    var db_credentials = new Object();
    db_credentials.user = process.env.AWS_USR;
    db_credentials.host = process.env.AWS_END;
    db_credentials.database = 'aa';
    db_credentials.password = process.env.AWSRDS_PW;
    db_credentials.port = 5432;

    var client = new Client(db_credentials);
    client.connect();

    // Sample SQL statement to query the entire contents of a table: 
    var thisQuery = "SELECT temperature, hour, minute FROM sensorDataTwo WHERE day = 22 AND hour BETWEEN 6 AND 7 ORDER BY hour;";

    client.query(thisQuery, (err, response) => {
        var output = response.rows;
        sensorOutput.push(output);
        console.log(err);
        var rawHtml = '';
        for (var i=0; i<sensorOutput.length; i++){
            rawHtml += "<h1>Today's Temperature!</h1><br><p>" 
                        + JSON.stringify(sensorOutput[i], null, 2) 
                        + "</p><br>";
        }
        rawHtml += "<h3>Footer</h3>"; 
        
        res.send(rawHtml);
        client.end();
    });
});

// serve static files in /public
app.use(express.static('public'));

// listen on port 8080
app.listen(port, function() {
    console.log(`Server listening on port ${port}...`);
});
