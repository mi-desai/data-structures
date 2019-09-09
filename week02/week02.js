var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ec2-user/environment/data/m05.txt');
var $ = cheerio.load(content);

var result = '';

$('td').each(function(i, elem) {
    $('h4, .detailsBox, span, b').remove();
    if($(elem).attr('style') === "border-bottom:1px solid #e3e3e3; width:260px") {
    result += ' - ' + ($(elem).text()).trim() + '\n' + '\n';
    }
});

result = result.replace(/\t/g,'').split(' - ');

console.log(result);

fs.writeFileSync('output4.txt', result);
