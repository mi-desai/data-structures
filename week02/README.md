<h2>Assignment</h2>

The assignment was to use Node.js and cheerio.js to write a program that will contain the street address for every row in a particular AA file. Per the instructions, the AA file I worked with was m05.txt, since my New School ID number, N0696815, ends with a "5."

The assignment provided the following starter code. 
<blockquote>
// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
var content = fs.readFileSync('data/thesis.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

// print (to the console) names of thesis students
$('h3').each(function(i, elem) {
    console.log($(elem).text());
});

// write the project titles to a text file
var thesisTitles = ''; // this variable will hold the lines of text

$('.project .title').each(function(i, elem) {
    thesisTitles += ($(elem).text()).trim() + '\n';
});

fs.writeFileSync('data/thesisTitles.txt', thesisTitles);
</blockquote>

<h2>Solution</h2>

The solution to this problem required navigation of the DOM elements via Cheerio, and cleaning up the addresses pulled so that it can be easily parsed for future use.
<blockquote>
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ec2-user/environment/data/m05.txt');
var $ = cheerio.load(content);
</blockquote>
Lines 1-2 load in the required libraries for the code to work: fs and cheerio.
Lines 3-5 create two objects captured in variables. Object 1, content, is pointed towards the m05.txt file. Object 2 creates a selector variable that allows cheerio to parse the html to navigate the DOM. 
<blockquote>
var result = '';

$('td').each(function(i, elem) {
    $('h4, .detailsBox, span, b').remove();
    if($(elem).attr('style') === "border-bottom:1px solid #e3e3e3; width:260px") {
    result += ' - ' + ($(elem).text()).trim() + '\n' + '\n';
    }
});
</blockquote>
An empty variable of "result" is created to pass the output of the operation of the function below. 

The cheerio object is called to look for all tags of td in the document. The jQuery method .each() is applied to make sure the selector gets every instance of td in the document. 

Secondly, the function selects and removes all h4's, all classes named detailsBox, the span element, and the bold styles within each instance of td. These removals were tested and added iteratively, since each one of them added extraneous or useless information to the data pull. Originally, I attempted to remove all div elements instead of .detailsBox but since there is an unclosed div tag near the top of the document, this removed all the content. So removing the class was the next best option. I further noticed that the image of wheelchair access and the alt attributes were pulling through, but were contained within a "span" tag so I removed that as well. Remvoing h4 and b allowed for names of the addresses to be removed from the output file. 

Third, the function then will select only elements contained with the style attributes of "border-bottom:1px solid #e3e3e3; width:260px" - these style tags happened to contain exactly the text we are looking for, the addresses, and do not repeat across other information we do not need. 

Fourth, I structured the empty result variable by adding a spaces and dashes to the beginning of each address, so that I can call those characters later on to form my array of addresses. I concatenate the text of the elements that fit my "if" logic, and are removed of their extraneous tags and classes, and then further add two line breaks to each entry so that the output document is more structured. Then I closed the function. 
<blockquote>
result = result.replace(/\t/g,'').split(' - ');

console.log(result);

fs.writeFileSync('output4.txt', result);
</blockquote>

The output from the function is still structured with many /t, which represent tabs. To remove the extra space that is not needed, I put in a replace() method on the result variable, and used the escape notation of / / to make sure it targetted all instances of \t. After noticing that this did not function the way I expected, I did some research and realized I could add a g to the replace() to make it a "global" change. 

Lastly, I wanted to make an array from each address. I did this with a split() method, spliting the array indices up by the " - " (spaces and dashes) that I added to the beginning of each element pulled by my function. 

Then I saved the modified results into the current working directory in my Cloud9 environment. 

<h2>Problems with the Solution</h2>

The text is still not structured optimally for a machine to read the addresses from my array. Specifically, the output looks like this: 
<blockquote>
,122 East 37th Street, Basement, 
(Betw Park & Lexington Avenues) NY 10016
</blockquote>

It still contains extraneous information like Basement and saying the address is between Park and Lexington. Further array modification is needed to make the array fully machine readable, but unfortunately, I ran out of time. Will update as ideas occur. 
