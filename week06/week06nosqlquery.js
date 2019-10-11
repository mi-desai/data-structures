// npm install aws-sdk
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();


// var params = {
//     TableName : "process-blog3",
//     KeyConditionExpression: "teacher = :primary and #mn = :sort", // the query expression
//     ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
//         "#mn" : "month", 
//     },
//     ExpressionAttributeValues: { // the query values
//         ":primary": {S: "Richard The"},
//         ":sort": {S: "9"}, 
//     }
// };

var params = {
    TableName : "process-blog3",
    KeyConditionExpression: "teacher = :primary", // the query expression
    ExpressionAttributeValues: { // the query values
        ":primary": {S: "Richard The"},
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});
