var jedi = require('./modules/jedi.js'),
fs = require('fs'),
path = require('path');


/// REGISTER ALL THE PADAWANS

var PADAWANS_DIR = "./padawans/";

fs.readdirSync(PADAWANS_DIR).forEach(function(padawan){
  require(PADAWANS_DIR + padawan)(jedi);
});

jedi.crawl('http://en.wikipedia.org/wiki/Montpellier,_France', function(err, data){
  console.log(data);
});

