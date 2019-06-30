const http = require('http');

let requestsProcessed = 0;
const server = http.createServer((request, response) => {
  requestsProcessed += 1;
  console.log('Incoming request #' + requestsProcessed);
  setTimeout(() => {
    response.statusCode = 200;
    response.end();
  }, 100);
});

server.listen(8000, (err) => {
  if (err) {
    console.log('Failed to run server ' + err)
  } else {
    console.log('Server started');
  }
});