//Dependency imports

const express = require('express'),
    app = express();
const bodyParser = require('body-parser');
const path = require('path');
let dir = __dirname;
const handlebars = require('handlebars');

//ENV and ports

const dotenv = require('dotenv').config({ path: '/home/ec2-user/environment/.env' });
const port = 8080;

// PostgreSQL set-up

const { Client } = require('pg');
var db_credentials = new Object();
db_credentials.user = process.env.AWS_USR;
db_credentials.host = process.env.AWS_END;
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Dynamo DB set-up

var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";
var dynamodb = new AWS.DynamoDB();

// Express set-up - templating engine

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Serve static file folders

app.use(express.static(path.join(dir, '/public')));
app.use('/img', express.static(path.join(dir, 'public/img')));
app.use('/js', express.static(path.join(dir, 'public/js')));
app.use('/css', express.static(path.join(dir, 'public/css')));
app.set('views', path.join(dir, 'public/views'));

// Use body parser to make data available in req.body

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Setup Varaiables

let aaoutput = [];
let sensorOutput = [];

//Index + Landing Page and test EJS

app.get('/', function(req, res) {
    res.render('index', { xyz: 'hello!' });
});

// AA Map page default html, automatically goes to getAAdata for the currently checked boxes. 

app.get('/aa', function(req, res) {
    res.render('aa', { data: 'success!' });
});

// Queries for AA data

app.post('/getAAdata', function(req, res) {

    //receiving from the checkboxes' selections an object defining the conditions the user wants
    let conditions = req.body;

    //informal table join between meetings and instances where the meetingID's match
    //keep a testQuery string for debugging purposes
    let query = 'WHERE m.meetingID = i.meetingID ';
    let testQuery = 'WHERE m.meetingID = i.meetingID ';

    //building query string with WEEKDAYS passed from checked selections
    //in the conditions object passed from the front-end checkboxes, there are three parameters with arrays that are funneled into each query in the following 'if' statements.
    //if a weekday array is detected, the forEach function is applied that pushes the weekday into a string and then joined by an AND with OR's between each specific weekday.
    //I build a testquery so I could test stuff
    if (conditions['weekday']) {
        let items = [];
        conditions['weekday'].forEach(
            (item) => {
                items.push(`weekday = '${item}'`);
            }
        );
        query += ' AND (' + items.join(' OR ') + ')';
        testQuery += ' AND (' + items.join(' OR ') + ')';
    }

    //building query with TIMES passed from checked selections
    //times was a bit tricky. The forEach had to remove square brackets first, then iterate through all individual time arrays passed back to populate the query string. I chose to focus only on start times since users may want to only focus on what time something starts, rather than the time it ends. 

    if (conditions['times']) {
        let items = [];
        conditions['times'].forEach(
            (item) => {
                let range = item.replace('[', '').replace(']', '').split(',');
                items.push(range);
            }
        );
        let timeItems = [];
        for (let i = 0; i < items.length; i++) {
            let timeClause = '(startTime >= ' + items[i][0] + ' AND startTime <= ' + items[i][1] + ')';
            timeItems.push(timeClause);
        }
        query += ' AND (' + timeItems.join(' OR ') + ') ';
    }

    //building query with TYPES passed from checked selections
    //types was much easier. By examining all the unique types, I passed in the exact value of the parameter to the checkbox value in my html. This way, when the checkbox is selected and a query sent, it passes back the exact parameter value needed for the data to be obtained (example: BB = Big Book Meeting)

    if (conditions['type']) {
        let items = [];
        conditions['type'].forEach(
            (item) => {
                items.push(`i.type ${item}`);
            }
        );
        query += ' AND (' + items.join(' OR ') + ')';
        testQuery += ' AND (' + items.join(' OR ') + ')';
    }

    //thisQuery is then constructed with the value of "query" as it goes through the above logic. 

    var client = new Client(db_credentials);
    client.connect();

    var thisQuery = `SELECT * FROM meetings m, instances i ${query};`;

    var thisTest = `SELECT m.location, m.fulladdress, m.latitude, m.longitude, i.weekday, i.startTime, i.type, i.endTime FROM meetings m, instances i ${testQuery};`;

    console.log(thisQuery);
    client.query(thisQuery, (err, response) => {
        // console.log(response.rows); 
        console.log(err);
        if (err) {
            res.status(500).json(err);
            console.log("Application Crashed!");
            client.end();
        }

        //After a valid response has been received, I wrote more code to map it to a valid geoJSON that can be interpreted by Leaflet without processing on the front-end. Each object in a geoJSON has a a geometry property with a lat/long pair as an array, and a features sub-object with anything the user wants in it. 
        /*The idea behind checking for existing long/lat pairs and meetingID's in each loop is so that:
            -Each lat/long is unique and there are no repeats, since there might be multiple meetings, with multiple meeting times at each lat/long
            -So on each loop through response.rows, test for existing lat/longs and meetingID's, and perform different actions based on these contingencies. 
        */

        let results = response.rows;

        const features = [];

        results.forEach(
            (row) => {
                // checks for existing lat/long record already pushed to 'features', which is the end array that goes into the repsonse object, found will return "found" or "null"
                const found = features.find(
                    (ele) => ele.geometry.coordinates[0] === row.longitude && ele.geometry.coordinates[1] === row.latitude
                );
                // if "found" returns a "found" Boolean, another binary function is run to see if the found meeting has the same meetingID.

                if (found) {
                    //checks for existing lat/long record and returns found or null
                    const foundMeeting = found.properties.meetings.find(
                        (ele) => ele.meetingid === row.meetingid
                    );

                    if (foundMeeting) {
                        //checks for existing meeting if a matching lat/long pair is found, returns "foundMeeting" or null
                        foundMeeting.instances.push({
                            type: row.type,
                            interest: row.interest,
                            weekday: row.weekday,
                            startTime: row.starttime,
                            endTime: row.endtime
                        });
                    }

                    else {
                        //If no match is found for the meetingID, a new meeting with all its meeting instances is pushed to the features array BUT STILL WITHIN the same object with a unique lat/long pair
                        found.properties.meetings.push({
                            meetingid: row.meetingid,
                            name: row.name,
                            location: row.location,
                            instances: [{
                                type: row.type,
                                interest: row.interest,
                                weekday: row.weekday,
                                startTime: row.starttime,
                                endTime: row.endtime
                            }]
                        });
                    }
                }

                //if a new lat/long pair is found, proceed immediately to this step.
                else {
                    //new lat/long is mapped to feature and properties.
                    let record = {
                        type: 'Feature',
                        properties: {
                            address: row.fulladdress,
                            meetings: []
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [row.longitude, row.latitude]
                        },
                    };

                    record.properties.meetings.push({
                        meetingid: row.meetingid,
                        name: row.name,
                        location: row.location,
                        instances: [{
                            type: row.type,
                            interest: row.interest,
                            weekday: row.weekday,
                            startTime: row.starttime,
                            endTime: row.endtime
                        }]
                    });
                    features.push(record);
                }
            }
        );


        res.json({
            "type": "FeatureCollection",
            "features": features
        });
    
        client.end();
    });
});



//Process blog stuff
app.get('/blog', function(req, res) {
    res.render('blog', { data: 'success!' });
});

app.post('/getBlog', function(req, res) {
    let parameters = req.body;
    console.log(parameters);

    var params = {
        TableName: "Blog",
        KeyConditionExpression: "Assignment = :assignmentName", // the query expression
        ExpressionAttributeValues: { // the query values
            ":assignmentName": { S: `${parameters.category}` }
        }
    };

    let response = '';

    dynamodb.query(params, function(err, data) {
        console.log(params);
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        }
        else {
            //There is only ever one blog post for each assignment, so I got rid of the forEach in the starter code.
            console.log("Query succeeded.");
            console.log(data.Items);
            res.send(data.Items);
            }
        }
    );
});


//Sensor Application

app.get('/sensor', function(req, res) {
    res.render('sensor', { data: 'success!' });
});

app.post('/sensorGrab', function(req, res) {
    //Inputs should already be in timestamp format that allows for direct insertion into the query.
    let inputs = req.body;
    console.log(inputs);

    var db_credentials = new Object();
    db_credentials.user = process.env.AWS_USR;
    db_credentials.host = process.env.AWS_END;
    db_credentials.database = 'aa';
    db_credentials.password = process.env.AWSRDS_PW;
    db_credentials.port = 5432;

    var client = new Client(db_credentials);
    client.connect();

    // The SQL Query passes in our timestamps as parameters in WHERE's joined by an AND, and then we reduce the total amount of data going back to the front end by taking the average and then GROUP BY hour, and by each individual date. This reduces the total amount of data points from an unmanageable tens of thousands to, at most, 800 data points or 24 per day for 30+/-5 or so days.
    //However, it is acknowledged that as time passes, this number will increase by 24 data points per day and slowly get to a point where the data cannot be loaded into the browser. Admittedly, I did not look that far ahead. 
    var thisQuery = `SELECT AVG(temperature), DATE_PART('hour', time) as hour, time::date as day FROM sensorDataTwo WHERE time >= TIMESTAMP '${inputs.start}' AND time <= TIMESTAMP '${inputs.end}' GROUP BY (DATE_PART('hour', time), time::date) ORDER BY day;`;

    //the original query had to limit to a few hundred to avoid causing the browser to crash when loading the response JSON
    var testQuery = `SELECT temperature, time FROM sensorDataTwo LIMIT 150;`;

    client.query(thisQuery, (err, response) => {
        console.log(thisQuery);
        let output = response.rows;
        console.log(err);
        res.send(output);
        client.end();
    });
});


//Controls for public and ports
// serve static files in /public
app.use(express.static('public'));

// listen on port 8080
app.listen(8080, function() {
    console.log(`Server listening on port ${port}...`);
});
