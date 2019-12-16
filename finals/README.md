# Documentation for Final Projects in Data Structures

Live Site: http://204.236.247.193:8080/

## Overall Structure of the Website + Server

Instead of a templating engine like pug, ejs, or handlebars, I looked into ways I could structure the Express app to use html pages in specific folders. I was able to accomplish this using the following code: 

```javascript
const bodyParser = require('body-parser');
const path = require('path');
let dir = __dirname;

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
```

Setting the view engine as html tells Express to look for html files to render when the route is called (i.e. when '/' is called it loads the index.html file, when '/aa' is called, it loads the aa.html file).

By setting 'views' a path using "path", and __dirname to tell it the location of a currently running file, you can set up a complex website with multiple file locations. Most of this I was able to use from Express tutorials. 

Of additional interest is the use of bodyParser, which I copied from a tutorial on Express which allows for req.body from the front-end to be sent as a JSON, which simplifies the process of getting the values into the queries for the databases. 

## AA Map

This is the project I had the most fun with since the data was extremely complex but the most potentially useful to an end user. 

It also ended up being the closest to my original design, which I was happy about. 

There were many steps that over the course of several weeks I was able to implement for the code. 

### First Step - Front End Design

I wanted users to be able to click a series of checkboxes to set parameters that would then be used to search the AA database I created. The easy part was creating the checkboxes in HTML, and setting their values. 

I had to decide what they could search by. In the end, I decided that a range of meeting times represented by periods of time during the day and night, meeting types, which were prominently featured in the data, and days of the week were appropriate.

I opted for a "submit button" design to simplify the jQuery to write. I broke each and every 'action' needed by the code into separate functions instead of trying to do everything in one function. Upon hitting submit, this is what happens: 

<ul>
<li>1. The values of all checked checkboxes are collected and passed on.</li>
<li>2. The values of the checkboxes are mapped to an array within an object that has three properties for weekdays, times, and types. If "all" is checked, the property is empty. All is found with a * in the value, which I wrote three separate sub-functions for. Then the data is passed on once again. The structure of the request in this stage makes it easier to deal with in app.js. Additionally, in this stage, asynchronicity is addressed using .then(). First I call a function called getData(query).then(renderPage). By writing it this way, the query is resolved before the page attempts to be rendered. </li>
<li>3. The function getData() is called, which also deals with asynchronicity by creating a promise that is resolved upon receiving a response. This may be a little redundant with .then() but I decided to use both. Within the Promise, $.post in jQuery ajax is used to invoke a route in Express and send the query Structure back to the server.</li>
<li>4. At this point, the data has been transferred to the server-side in app.js. Using req.body, I can use bodyParser to deal with the json vesion of the request I sent back, which is nice. Using the conditions, the string begins to be built up.</li>
</ul>

### Second Step - What Happens on the Server Side?

At this point, the query starts to be built using each of the parameters passed back from the checkboxes. This was accomplished by using a REALLY REALLY LONG where clause in PostgreSQL. 

For my AA data, I had two separate tables. Since the AA meeting data had a hierarchy. There were addresses where meetings were held, there were many meetings sometimes in the same locations but sometimes not, and at each meeting there were multiple times that the meetings convened. So it is three layers of data. 

But the first issue was making sure I was querying both tables at the same time. 

I accomplished this using an informal JOIN below (meeting was one table, instance was another table, both listed as m and i respectively): 

```javascript
let query = 'WHERE m.meetingID = i.meetingID ';
```
For each query set of conditions - times, weekdays, and types, "if" statements were set up to take the array of conditions and construct a single query string. 

For example, if a weekday array is detected, the forEach function is applied that pushes the weekday into a string and then joined by an AND with OR's between each specific weekday to get rid of the array.

```javascript
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
```

Times was a bit tricky. The forEach had to remove square brackets first, then iterate through all individual time arrays passed back to populate the query string. I chose to focus only on start times since users may want to only focus on what time something starts, rather than the time it ends. This required going through all items twice, first to remove brackets, and secondly to build the string.

```javascript
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
```

For types, a similar approach was taken. 

However, we are not done!

I undertook an extra challenge of mapping the response from PostgreSQL into a geoJSON, which was extremely challenging and took the better part of three days to get right. The reason I wanted to do this was to make coding on the front-end easier for any query, since Leaflet already knows what to do with a geoJSON anyway, it would make getting all the appropriate lat/longs out of the reponse and onto the map much, much easier. To see process, read the commented code below.

```javascript
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
```

### Third Step - Back on the Front-End to Map it all

Once it was all on the front-end. I tested and debugged until I was sure the query was correctly returning the right results. 

Most of this part was devoted to just putting text into the popUp in Leaflet so that people could see all the meetings or meeting times at any given address, which seemed simple enough but ended up taking quite a lot of time. I'm glad that I decided to map to a geoJSON, since it means that each specific address has multiple meetings associated with it, which I think is the correct approach and allows the user to see how complete the data is. 

I am somewhat dissatisfied with my scraping earlier in the semester after doing this project, since I should have cleaned up more data. 

## Sensor

This was another really interesting project for me, since I was taking temperature measurements in my room every 30 seconds quite deliberately to see how difficult it would be to deal with a large amount of data (it worked, it was difficult). 

My design completely diverged from what I had originally planned, mostly because I couldn't successfully query things like Standard Deviation by hour, and by day, and that there is no easy way to get the median, which is what I really wanted.

I used base code for a jQuery UI Slider from here: https://jqueryui.com/slider/#range 

I mapped everything to date strings so I could pass in dates from the current positions of the boxes on the slider to the back-end, query the DB, then send it to the graph on the front-end to be drawn. 

I chose not to use D3 for this to cut down on development time. I used an open-source alternative called tui-charts that is able to do simple graphs in a lot less code than D3. 

Essentially, what is happening here on the front-end is exactly the same as the AA-map. Again, I broke everything up into small functions so I could debug more efficiently. On the "submit" button being pressed, the range being printed out from the slider is passed to another function that structures it further, then passes it to $.post() function in jQuery Ajax that calls '/sensorGrab,' the route set up in my Express code in app.js. 

After a response is received, the rest of the page is rendered. 

There's a little bit of front-end processing that happens to allow data to be read in by tui.charts, but once it is in, the chart is rendered. If another query is submitted, the chart is cleared and then redrawn. 

On the server side: 

The SQL Query passes in our timestamps from the slider as parameters in WHERE's joined by an AND, and then we reduce the total amount of data going back to the front end by taking the average and then GROUP BY hour, and by each individual date. This reduces the total amount of data points from an unmanageable tens of thousands to, at most, 800 data points or 24 per day for 30+/-5 or so days.

```javascript
 var thisQuery = `SELECT AVG(temperature), DATE_PART('hour', time) as hour, time::date as day FROM sensorDataTwo WHERE time >= TIMESTAMP '${inputs.start}' AND time <= TIMESTAMP '${inputs.end}' GROUP BY (DATE_PART('hour', time), time::date) ORDER BY day;`;
```

However, it is acknowledged that as time passes, this number will increase by 24 data points per day and slowly get to a point where the data cannot be loaded into the browser. Admittedly, I did not look that far ahead.

I was able to reuse a huge amount of code from the first project and change only data structures and the query.

## Blog

The Blog was the simplest code to write, but the hardest to know what to do with as an interface. Originally, my design involved ranking the blog posts by hours spent on them, which I ended up not recording in my blogposts at all. Additionally, my primary key was for project assignments, and I didn't have a sort key, which really limited the interface that I could actually use to query the DB. In the future, it's probably better to plan out the DB's structure at the same time as the interface to allow for better querying and UI design. 

But again, the code was very similar to what I had done with the Sensor and the AA Map. Using a drop-down, I passed values back from the HTML into app.js, and used them to query the appropriate blogpost and return it to the front-end, where it was rendered using jQuery and CSS. 

In fact, the jQuery for this page, since it did not deal with numbers or multiple values AT ALL, was the easiest to write and this is evident since it is only 36 lines of code versus over 150 lines for the other two applications. 

The other easy component of this was that each assignment, which was my Partition Key, was completely unique, so there were never multiple Items returned from the Query to deal with. Each selection on the drop-down would only have one item returned to it. While this made it easier, it was a little disappointing from a "learning to code and deal with big data effectively" - if I could redo my process blog from the beginning to make it more fun to query, I may have been able to do more with this database. 

```javascript
$(function() {
    $(document).ready(function() {
        $('select').change(function() {
        buildQuery();
        });
        
     function buildQuery(){
    let parameters = {category: $('select[name="assignment"]').val()};
    console.log(parameters);
    getData(parameters).then(renderPage);
     }
    
    function getData(query) {
            return new Promise((resolve, reject) => {
                $.post({
                    url: '/getBlog',
                    data: query,
                    success: (result) => {
                        resolve(result);
                    }
                });
            });
        }
    
    function renderPage(results) {
        console.log(results);
        let elements = results[0];
        elements.coding.BOOL = "Coding Assignment";
        elements.reading.BOOL = "Reading Assignment";
        $('.Subject').text("Class: " + elements.Category.S).show();
        $('.Assignment').text("Assignment: " + elements.Assignment.S).show();
        $('.Language').text("Languages Used: " + elements.language.S).show();
        $('.Description').text("My Take: " + elements.description.S).show();
    }
    });
});
```