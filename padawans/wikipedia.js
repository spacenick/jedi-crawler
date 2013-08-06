// Wikipedia crawler
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