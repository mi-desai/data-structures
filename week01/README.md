<h1>Week01 Homework Assignment</h1>

<b>Starter code from assignment is as follows:</b>
<blockquote>
// npm install request
// mkdir data

var request = require('request');
var fs = require('fs');

request('https://parsons.nyc/thesis-2019/', function(error, response, body){
    if (!error && response.statusCode == 200) {
        fs.writeFileSync('/home/ec2-user/environment/data/thesis.txt', body);
    }
    else {console.log("Request failed!")}
});
</blockquote>

<h2>Task Description / Preliminary Steps:</h2>

The task is to request 10 URL's and save them as text files without manual inputs.

The project has two outside code package dependencies: fs and request. Thus, the real first step is to npm install request AND npm install fs into the console to make sure dependencies have been imported. 

<h2>Solution</h2>

1. A variable named urls was created to store the URL's to be requested. 
<blockquote>
var urls = ['https://parsons.nyc/aa/m01.html',  
    'https://parsons.nyc/aa/m02.html',
    'https://parsons.nyc/aa/m03.html',
    'https://parsons.nyc/aa/m04.html',
    'https://parsons.nyc/aa/m05.html',
    'https://parsons.nyc/aa/m06.html',
    'https://parsons.nyc/aa/m07.html',
    'https://parsons.nyc/aa/m08.html',
    'https://parsons.nyc/aa/m09.html',
    'https://parsons.nyc/aa/m10.html'];
</blockquote>

2. A variable named fns was created to name the text files that would be saved to the current working directory. 
<blockquote>
var fns = ['m01.txt',
   'm02.txt',
   'm03.txt',
   'm04.txt',
   'm05.txt',
   'm06.txt',
   'm07.txt',
   'm08.txt',
   'm09.txt',
   'm10.txt'
   ];
 </blockquote>
 
 3. The request itself was put inside of a new function called getAndWrite(). I made sure the request was referencing the urls variable array, and made sure that getAndWrite() would begin with the "i"-th point in the urls variable array, which will be defined in a for loop. Finally, I changed fs.writeFileSync method to reference the fns variable array, also beginning with i (so that the first url would be requested and the first fns file would be working off the same index). 
 <blockquote>
 function getAndWrite(i){
    request(urls[i], function(error, response, body){
        if (!error && response.statusCode == 200) {
        fs.writeFileSync (fns[i], body);
        }
        else {console.log("Request failed!")}
     });
}
</blockquote>

4. Using a for loop that iterates by each successive element in an array, I called the function getAndWrite, which caused the files to be saved in the current working directory. 
<blockquote>
for (var i=0; i<10; i++){
getAndWrite(i);    
}
</blockquote>

<h2>Problems with the Solution</h2>

I was not able to determine how to change the directory where the files would be saved. May update this at a later time. 

