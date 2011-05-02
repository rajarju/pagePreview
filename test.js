var request = require('request'),
jsdom = require('jsdom'),
$ = require('jquery'),
sys = require('sys');

request({
  uri:'http://www.google.com'
}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //sys.puts(body) // Print the google web page.
    jsdom.env(body, null, function(e, window){
      //console.log(window.document.title);
      console.log($('title', window.document).html());
    })
  }
});