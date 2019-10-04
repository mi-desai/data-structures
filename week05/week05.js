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

//console.log(blogEntries);

var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";
var dynamodb = new AWS.DynamoDB();

//Using async.eachSeries to apply across all blogEntries, callback timer set to 1 second to avoid 2 puts per second as specified in assignment starter code. 

async.eachSeries(blogEntries, function(blogEntry, callback) {

  var params = {};
  params.Item = blogEntry; 
  params.TableName = "process-blog2";

  dynamodb.putItem(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    });

    setTimeout(callback, 1000); 
      });
