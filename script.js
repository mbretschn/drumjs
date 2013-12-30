var filename = './contrib/iso-country/iso-3166-1.json';
var fileJSON = require(filename);
var out = "{";
for (var code in fileJSON.Results)
	out += "\n   '" + code + "' : '" + fileJSON.Results[code].Name + "',";
out += "\n}";

var fs = require('fs');
fs.writeFile("countries.json", out, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 