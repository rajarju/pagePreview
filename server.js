/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//require.paths.unshift(__dirname + '/lib');
//Include Libs
var request = require('request'),
fs = require('fs'),
http = require('http'),
url = require('url'),
path = require('path'),
jsdom = require('jsdom'),
$ = require('jquery'),
sys = require('sys'),
im = require('imagemagick');

/**
 * Globals
 */
var imagePath = 'images/';


/**
 * helper functions
 */

//Send Error Message to client
function sendError(code, response) {
  response.writeHead(code);
  response.end();
  return;
}

//Init Server
var app = http.createServer(function(req, res){
  var full_route = url.parse(req.url, true);
  //console.log(full_route)
  switch(full_route.pathname){

    case '/read':
      console.log('read');
      var query =  url.parse(req.url, true).query;
      
      var target_host = url.parse(query.target_url, true).host;
      
      if(query.target_url){
        //Should Clean this
        //SHould checkif valud
        var target_url = query.target_url;
        console.log(target_host);

        request({
          uri : target_url
        }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //sys.puts(body) // Print the google web page.
            jsdom.env(body, null, function(e, window){
              //console.log(window.document.title);
              //console.log($('title', window.document).html());
              data = {
                title: null,
                img: [],
                desc: null
              };
              data.title = $('title', window.document).text();
          
              data.desc = $('meta[name=description]', window.document).text();
              if(data.desc == ''){
                data.desc = $('p', window.document).eq(0).text();
              }
              $('img', window.document).each(function(i, j){
                //data.img.push(j.src);

                //Image magic resize image and save in path
                im.resize({
                  srcPath: j.src,
                  dstPath: imagePath + target_host + '-' + i + '.jpg',
                  format: 'jpg',
                  width:   100
                }, function(err, stdout, stderr){
                  //if (err) throw err
                  console.log('resized ' + j.src + ' to fit within 100xx');
                });
                //Generate new url
                data.img.push('/images?src=' + target_host + '-' + i + '.jpg');

              });

              //  console.log(data);
              res.writeHead(200);
              res.write(JSON.stringify(data));
              res.end();

            })
          }
        });

      }
      else{
        sendError(404, res)
      }
      break;

    case '/images':
      //When accessing site for images
      //Temporarily letting the browser access the image thru the node system
      //SHould be done thru the apace or cdn layer
      //Should clean the query

      var img =  url.parse(req.url, true).query.src;


      fs.readFile( imagePath + img, function(err, data){
        if(err) {
          sendError(404, res)
        }          
        else{
          res.writeHead(200);
          res.write(data);
          res.end();
        }
      });
      
      break;

    case '/':
      fs.readFile(__dirname + '/index.html', function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        res.write(data, 'utf8');
        res.end();
      });
      break;
      break;

  }
});

app.listen(9080);



