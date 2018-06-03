/* Primary file for API */

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

//Server responds to all request with a string
const server = http.createServer((req, res) => {
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
});

//Start server, have it listen on port 3000
server.listen(3000, () => {
  console.log(`I am listening on 3000`);
})

//Define handlers
let handlers = {};

//Sample handler
handlers.sample = (data, callback) => {
  //Callback http status code and a payload object
  callback(406, {'name': 'sampler handler'});
};

//Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

//Define a router
const router = {
  "sample" : handlers.sample
};
