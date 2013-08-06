JEDI CRAWLER
================================

Da fuq?
-------------------------

JEDI CRAWLER is a Node/PhantomJS crawler made to scrape pretty much anything from Node, with a really simple syntax. Work in progress ladies

How does it work
-------------------------
Register padawans to the jedi crawler, that have a pattern to match URL, and jQuery-style selectors. You can also post-process the data.

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
For now only two types of selectors are supported : "text" and "src",


You can then load your padawans to the Jedi by doing

```javascript
var jedi = require('./modules/jedi');
require('./padawans/wikipedia')(jedi);
```

But anyway check the code

Special features
-----------------

Crawlers **only** start to scrape the page **as soon as $(document).ready is fired**. Our own version of jQuery is injected into the page, but then we also give back the $ to its owner in case they're executing 3rd party libraries to modify the DOM or w/e

Right now, PhantomJS is instantiated with "--load-images=no" option so the page loads faster

Test it now
-----------------
Pull that bad boy
Make sure you have PhantomJS installed
Run node main.js