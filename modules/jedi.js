var phantom = require('node-phantom'),
_ = require('lodash');

// Instantiate phantom internal function
var init = function(callback) {
    phantom.create(callback, {parameters:{'load-images':'no','ignore-ssl-errors':'yes'}});
};

var padawans = [];

var findMatchingPadawan = function(url) {
    var found = _.find(padawans,function(padawan){
        return padawan.pattern.exec(url);
    });
    return found;
};


module.exports = {
    crawl: function(url, callbackFunction, data) {

        // We need to find a matching padawan that will process teh data feel me?
        var padawan = findMatchingPadawan(url);
        if (!padawan) {
            return callbackFunction("No crawler found for this URL ("+url+")");
        }

        if (!padawan.selectors) {
            return callbackFunction('No selectors found for this padawan...')
        }

        // let's init that mysterious phantomJS
        init(function(err, ph) {
            // Create a page
            ph.createPage(function(err, page) {

                // by the PhantomJS team; just adjusted it for node-phantom bridge
                // https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
                var waitFor = function (testFx, onReady, timeOutMillis) {
                    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
                    start = new Date().getTime(),
                    condition = false,
                    interval = setInterval(function() {
                        if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                            // If not time-out yet and condition not yet fulfilled
                            // Adjustement is made here (NK) -- we need to pass a callback
                            testFx(function(err,result){
                                condition = result;
                            });
                        } else {
                            if(!condition) {
                                // If condition still not fulfilled (timeout but condition is 'false')
                                console.log("'waitFor()' timeout");
                                phantom.exit(1);
                            } else {
                                // Condition fulfilled (timeout and/or condition is 'true')
                                console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                                typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                                clearInterval(interval); //< Stop this interval
                            }
                        }
                    }, 100); //< repeat check every 100ms
                };


                // Let's open the URL
                page.open(url, function(err, status) {   
                    if (status !== "success") {
                        callbackFunction("An error occured while opening the page with Phantom : "+status);
                        ph.exit();
                        return;
                    }

                    // Let's include latest jQuery bitches   
                    page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js', function(err) {
                        
                        // Let's drop a variable when DOM is ready
                        // We do that straight after including jQ
                        page.evaluate(function(){
                            window.$JEDI = $.noConflict();
                            // Give back $ to its previous owner in case
                            // they're doing some random shit on the DOM with custom libs
                            window.$JEDI(document).ready(function(){
                                window['JEDI-DOM-LOADED-BITCHES'] = true;
                            });
                        });
                        // Wait for the DOM to be loaded!
                        waitFor(function(resultCallback){
                            return page.evaluate(function(){
                                return window['JEDI-DOM-LOADED-BITCHES'] == true;
                            }, resultCallback);
                        },
                        function(){
                            return page.evaluate(function(data){

                                var result = {};
                                for (var key in data) {
                                    var sel = window.$JEDI(data[key].sel);
                                    var type = data[key].type;

                                    var getValue = function(sel, type) {
                                        if (type == "text") {
                                            return sel.text();
                                        }
                                        else if (type == "src") {
                                            return sel.attr('src');
                                        }
                                    };

                                    if (sel.length == 1) {
                                        result[key] = getValue(sel, type);
                                    }
                                    else if (sel.length > 1) {
                                        result[key] = [];
                                        sel.each(function(){
                                            result[key].push(getValue(window.$JEDI(this), type));
                                        });
                                    }
                                    else {
                                        result[key] = null;
                                    }
                                    
                                }
                                return result;

                            }, function(err, result) {
                                // postProcessing is not mandatory and is just identity function if doesnt exist
                                var postProcessing = padawan.postProcessing ? padawan.postProcessing : function(d) { return d; };
                                callbackFunction(null, postProcessing(result));
                                ph.exit();
                            }, padawan.selectors);
                        });

                    });
                });
            });
        });
    },
    // No headscrapping for now I'm just pushing that shit in an array
    registerPadawan: function(padawan) {
        if (!padawan || !padawan.pattern) {
            console.error('A pattern is needed dude.');
            return false;
        }

        console.log('Registering a padawan that will match '+padawan.pattern);
        padawans.push(padawan);
    }
};