var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req,res) {
  if(req.url === '/') {
    fs.createReadStream("index.html").pipe(res);
  }
  else if(req.url === '/styles') {
    fs.createReadStream("assets/stylesheets/main.css").pipe(res);
  }
  else if(req.url === '/app') {
    fs.createReadStream("assets/javascripts/minified/main.js").pipe(res);
  }
  else {
    res.end('Nothing here');
  }
});

server.listen(3000);
