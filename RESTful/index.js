/* Primary file for API */

//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

 // Instantiate the HTTP server
 const httpServer = http.createServer((req,res) => {
  unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort,() => {
  console.log('The HTTP server is running on port '+config.httpPort);
});

// Instantiate the HTTPS server
let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions,(req,res) => {
  unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort,() => {
 console.log('The HTTPS server is running on port '+config.httpsPort);
});

//Unifed server
const unifiedServer = (req, res) => {
  //Parse URL
  const parsedURL = url.parse(req.url, true);
  //Get URL path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  //Get query string as an object
  const queryStringObject = parsedURL.query;
  //Get HTTP Method
  const method = req.method.toLowerCase();
  //Get the headers as an object
  const headers = req.headers;
  // Get payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => buffer += decoder.write(data));
  req.on('end', () => {
    buffer += decoder.end();
    //Choose handler request path. If one is not found, use not found handler
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 
    //Construct data object to send to handler
    const data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };
    //Route request to handler
    chosenHandler(data, (statusCode, payload) => {
      //Define default status code
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      //Define default payload
      payload = typeof(payload) == 'object' ? payload : {};
      //Convert payload to string
      const payloadString = JSON.stringify(payload);
      //Return response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response: ", statusCode, payloadString);
    })

  })
};

//Define handlers
let handlers = {};

// Ping handler
handlers.ping = (data,callback) => {
  callback(200);
};

//Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

//Define a router
const router = {
  'ping' : handlers.ping
};
