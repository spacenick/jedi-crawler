var phantom = require('node-phantom'),
_ = require('lodash');

var init = function(callback) {
  phantom.create(callback, {parameters:{'ignore-ssl-errors':'yes'}});
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

    var padawan = findMatchingPadawan(url);
    if (!padawan) {
      return callbackFunction("No crawler found for this URL ("+url+")");
    }

    if (!padawan.selectors) {
      return callbackFunction('No selectors found for this padawan...')
    }

    init(function(err, ph) {
      ph.createPage(function(err, page) {

        var waitFor = function (testFx, onReady, timeOutMillis) {
          var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
          start = new Date().getTime(),
          condition = false,
          interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
              testFx(function(err,result){
                condition = result;
              });
            } else {
              if(!condition) {
                console.log("'waitFor()' timeout");
                ph.exit();
              } else {
                console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                typeof(onReady) === "string" ? eval(onReady) : onReady();
                clearInterval(interval);
              }
            }
          }, 100);
        };


        page.open(url, function(err, status) {
          if (status !== "success") {
            ph.exit();
            callbackFunction("An error occured while opening the page with Phantom : "+status);
            return;
          }

          page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js', function(err) {

            page.evaluate(function(){
              window.$JEDI = $.noConflict(true);
              window.$JEDI(document).ready(function(){
                window['JEDI-DOM-LOADED-BITCHES'] = true;
              });
            });
            waitFor(function(resultCallback){
              return page.evaluate(function(){
                return window['JEDI-DOM-LOADED-BITCHES'] == true;
              }, resultCallback);
            },
            function(){
              return page.evaluate(function(data){
                return (function(){
                  var result = {};
                  for (var key in data) {
                    var sel = window.$JEDI(data[key].sel);
                    var type = data[key].type;

                    var getValue = function(sel, type) {
                      if (type == "text") {
                        return sel.text();
                      } else {
                        return sel.attr(type);
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
                })();

              }, function(err, result) {
                var postProcessing = padawan.postProcessing ? padawan.postProcessing : function(d) { return d; };
                ph.exit();
                callbackFunction(null, postProcessing(result));
              }, padawan.selectors);
            });
          });
        });
      });
    });
  },
  registerPadawan: function(padawan) {
    if (!padawan || !padawan.pattern) {
      console.error('A pattern is needed dude.');
      return false;
    }

    console.log('Registering a padawan that will match '+padawan.pattern);
    padawans.push(padawan);
  }
};