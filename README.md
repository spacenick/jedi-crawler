JEDI CRAWLER
================================

Da fuq?
-------------------------

JEDI CRAWLER is a Node/PhantomJS crawler made to scrape pretty much anything from Node, with a really simple syntax. Work in progress ladies

```
npm install jedi-crawler
```

How does it work
-------------------------
Register padawans to the jedi crawler, that have a pattern to match a URL, and jQuery-style selectors. You can also post-process the data if you need to do some treatment (number conversion, etc)

wikipedia.js:

```javascript
module.exports = function(jedi) {

  jedi.registerPadawan({
    // Pattern to match URL
    pattern: /en.wikipedia.org\/wiki\//,
    // Selectors to be executed
    selectors:{
      title:{
        sel: "#firstHeading span",
        type: "text"
      },
      firstParagraph:{
        sel: "#toc ~ p:first",
        type: "text"
      }
    },
    // You can choose to process the data AFTER being crawled.
    postProcessing: function(data) {
      /// Do your custom processing on the data processed
      data.title = data.title.toUpperCase();
      return data;
    }
  });

};
```

For now only two types of selectors are supported : "text" and "src"

I find having one file per padawan (crawler) pretty cool for code clarity and also padawans need to learn by themselve and be alone

```
npm install jedi-crawlers
```

You can then give your padawans to the Jedi by doing

```javascript
var jedi = require('jedi-crawler');
require('./padawans/wikipedia')(jedi);
```

And then you can do

```javascript
jedi.crawl('http://en.wikipedia.org/whatever', function(err, result){
  console.log(err);
  console.log(result);
});
```

As the jedi will figure out what padawan to use given on the URL and of the pattern you set


Special features
-----------------

Crawlers **only** start to scrape the page **as soon as $(document).ready is fired**. Our own version of jQuery is injected into the page, but then we also give back the $ to its owner in case they're executing 3rd party libraries to modify the DOM or w/e

If your selectors matches severals DOM elements, then an array of every value is returned

Right now, PhantomJS is instantiated with "--load-images=no" option so the page loads faster

Test it now
-----------------
Pull that bad boy
Make sure you have PhantomJS installed
Run node main.js