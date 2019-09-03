var request = require('request');
var fs = require('fs');

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

function getAndWrite(i){
    request(urls[i], function(error, response, body){
        if (!error && response.statusCode == 200) {
        fs.writeFileSync (fns[i], body);
        }
        else {console.log("Request failed!")}
     });
}

for (var i=0; i<10; i++){
getAndWrite(i);
}
